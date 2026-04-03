import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import {
  getWedding, getMemory, getPhotos, upsertMemory,
  uploadPhoto, deletePhoto, deleteWedding, deleteWeddingPhotos,
  updateWedding, getPhotoUrl, formatDateKR, type Photo, type Attendance,
} from '../../lib/db';
import { BRAND_PINK, ATTENDANCE_LABEL, ATTENDANCE_PILL_BG, ATTENDANCE_PILL_TEXT } from '../../lib/constants';
import { addWeddingToCalendar } from '../../lib/calendar';

const ATTENDANCE_OPTIONS: { value: Attendance; label: string }[] = [
  { value: 'attending', label: '참석' },
  { value: 'absent', label: '불참' },
  { value: 'pending', label: '미정' },
];

const EMOTION_TAGS = ['행복해 😊', '감동받았어 🥹', '설렜어 💕', '즐거웠어 🎉', '뭉클했어 💧', '배고팠어 🍽️'];

function PhotoCard({
  photo,
  onDelete,
}: {
  photo: Photo & { signedUrl?: string };
  onDelete: () => void;
}) {
  return (
    <View className="relative w-28 h-28 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
      {photo.signedUrl ? (
        <Image source={{ uri: photo.signedUrl }} className="w-full h-full" resizeMode="cover" />
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={BRAND_PINK} size="small" />
        </View>
      )}
      <TouchableOpacity
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel="사진 삭제"
        className="absolute top-1 right-1 bg-black/60 w-6 h-6 rounded-full items-center justify-center"
      >
        <Text className="text-white text-xs">✕</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: wedding, isLoading: wLoading } = useQuery({
    queryKey: ['wedding', id],
    queryFn: () => getWedding(id),
  });
  const { data: memory } = useQuery({
    queryKey: ['memory', id],
    queryFn: () => getMemory(id),
  });
  // refetchInterval: re-fetch photo list every 55 min so signed URLs
  // (1-hour expiry) are refreshed before they silently break.
  const { data: photos = [] } = useQuery({
    queryKey: ['photos', id],
    queryFn: () => getPhotos(id),
    refetchInterval: 55 * 60 * 1000,
  });

  const [memo, setMemo] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [giftAmount, setGiftAmount] = useState('');
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [calendarAdded, setCalendarAdded] = useState(false);

  useEffect(() => {
    if (memory) {
      setMemo(memory.memo ?? '');
      setSelectedTags(memory.emotion_tags ?? []);
      setGiftAmount(memory.gift_amount ? String(memory.gift_amount) : '');
    }
  }, [memory]);

  // Load (or refresh) signed URLs whenever the photos list changes.
  // photos refetches every 55 min (see query above), so URLs are renewed
  // before the 1-hour Supabase signed URL expiry.
  useEffect(() => {
    if (photos.length === 0) return;
    Promise.all(
      photos.map((p) => getPhotoUrl(p.storage_path).then((url) => ({ id: p.id, url })))
    )
      .then((results) => {
        setPhotoUrls(Object.fromEntries(results.map(({ id, url }) => [id, url])));
      })
      .catch((e: Error) => Alert.alert('사진 로딩 실패', e.message));
  }, [photos]);

  const saveMemory = useMutation({
    mutationFn: () =>
      upsertMemory(id, {
        memo: memo.trim() || undefined,
        emotion_tags: selectedTags,
        gift_amount: giftAmount ? Number(giftAmount) : null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['memory', id] });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    },
    onError: (e: Error) => Alert.alert('저장 실패', e.message),
  });

  const updateAttendance = useMutation({
    mutationFn: (att: Attendance) => updateWedding(id, { attendance: att }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wedding', id] });
      setEditingAttendance(false);
    },
    onError: (e: Error) => Alert.alert('저장 실패', e.message),
  });

  const addPhoto = useMutation({
    mutationFn: async (source: 'library' | 'camera') => {
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
      if (result.canceled) return;
      await uploadPhoto(id, result.assets[0].uri, result.assets[0].mimeType ?? undefined);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['photos', id] }),
    onError: (e: Error) => Alert.alert('업로드 실패', e.message),
  });

  const removePhoto = useMutation({
    mutationFn: ({ photoId, storagePath }: { photoId: string; storagePath: string }) =>
      deletePhoto(photoId, storagePath),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['photos', id] }),
  });

  async function confirmDeleteWedding() {
    setShowDeleteConfirm(false);
    try {
      await deleteWeddingPhotos(id);
      await deleteWedding(id);
      qc.invalidateQueries({ queryKey: ['weddings'] });
      router.back();
    } catch (e: any) {
      Alert.alert('삭제 실패', e.message);
    }
  }

  const isDirty =
    memo !== (memory?.memo ?? '') ||
    giftAmount !== (memory?.gift_amount ? String(memory.gift_amount) : '') ||
    JSON.stringify([...selectedTags].sort()) !== JSON.stringify([...(memory?.emotion_tags ?? [])].sort());

  function handleBack() {
    if (isDirty) {
      Alert.alert('저장하지 않은 변경사항', '나가면 변경사항이 사라져요.', [
        { text: '계속 편집', style: 'cancel' },
        { text: '나가기', style: 'destructive', onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  if (wLoading || !wedding) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color={BRAND_PINK} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-black"
    >
      <ScreenHeader
        left={
          <TouchableOpacity
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            className="py-2"
          >
            <Text className="text-white/50 text-base">← 뒤로</Text>
          </TouchableOpacity>
        }
        center={
          wedding ? (
            <Text className="text-white font-semibold text-sm" numberOfLines={1}>
              {wedding.groom} ♥ {wedding.bride}
            </Text>
          ) : undefined
        }
        right={
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => router.push(`/(app)/new?id=${id}`)}
              accessibilityRole="button"
              accessibilityLabel="편집"
            >
              <Text className="text-pink-400 text-sm">편집</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDeleteConfirm(true)}
              accessibilityRole="button"
              accessibilityLabel="삭제"
            >
              <Text className="text-white/30 text-sm">삭제</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        {/* Wedding Info */}
        <View className="mb-8">
          <Text className="text-white text-3xl font-bold mb-1">
            {wedding.groom} ♥ {wedding.bride}
          </Text>
          <Text className="text-white/50 text-base mb-1">{formatDateKR(wedding.date)}</Text>
          <Text className="text-white/30 text-sm mb-3">{wedding.venue}</Text>
          <View className="flex-row items-center gap-3 flex-wrap">
            {editingAttendance ? (
              <View className="flex-row gap-2">
                {ATTENDANCE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => updateAttendance.mutate(opt.value)}
                    disabled={updateAttendance.isPending}
                    accessibilityRole="radio"
                    accessibilityLabel={opt.label}
                    accessibilityState={{ selected: wedding.attendance === opt.value }}
                    className={`px-3 py-1 rounded-full border ${
                      wedding.attendance === opt.value
                        ? `${ATTENDANCE_PILL_BG[opt.value]} border-transparent`
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${
                      wedding.attendance === opt.value ? ATTENDANCE_PILL_TEXT[opt.value] : 'text-white/50'
                    }`}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => setEditingAttendance(false)} className="px-2 py-1">
                  <Text className="text-white/30 text-xs">닫기</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setEditingAttendance(true)}
                accessibilityRole="button"
                accessibilityLabel={`참석 여부: ${ATTENDANCE_LABEL[wedding.attendance]}. 탭하여 변경`}
                className={`self-start px-3 py-1 rounded-full ${ATTENDANCE_PILL_BG[wedding.attendance]}`}
              >
                <Text className={`text-xs font-bold ${ATTENDANCE_PILL_TEXT[wedding.attendance]}`}>
                  {ATTENDANCE_LABEL[wedding.attendance]} ✎
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={async () => {
                try {
                  await addWeddingToCalendar({
                    groom: wedding.groom,
                    bride: wedding.bride,
                    date: wedding.date,
                    venue: wedding.venue,
                  });
                  setCalendarAdded(true);
                  setTimeout(() => setCalendarAdded(false), 2000);
                } catch (e: any) {
                  Alert.alert('추가 실패', e.message);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel="캘린더에 추가"
              className={`flex-row items-center gap-1 px-3 py-1 rounded-full border ${calendarAdded ? 'bg-lime-400/20 border-lime-400/30' : 'bg-white/10 border-white/10'}`}
            >
              <Text className={`text-xs ${calendarAdded ? 'text-lime-400 font-semibold' : 'text-white/60'}`}>
                {calendarAdded ? '추가됨 ✓' : '캘린더'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-px bg-white/10 mb-8" />

        {/* Memory Section */}
        <Text className="text-white/40 text-xs mb-4">기억 기록</Text>

        {/* Memo */}
        <View className="mb-5">
          <Text className="text-white/40 text-xs mb-2">메모</Text>
          <TextInput
            value={memo}
            onChangeText={setMemo}
            placeholder="이날의 기억을 한 줄로..."
            placeholderTextColor="#ffffff33"
            multiline
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm min-h-20"
            style={{ textAlignVertical: 'top' }}
          />
        </View>

        {/* Emotion Tags */}
        <View className="mb-5">
          <Text className="text-white/40 text-xs mb-2">감정</Text>
          <View className="flex-row flex-wrap gap-2">
            {EMOTION_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                onPress={() => toggleTag(tag)}
                accessibilityRole="checkbox"
                accessibilityLabel={tag}
                accessibilityState={{ checked: selectedTags.includes(tag) }}
                className={`px-3 py-2 rounded-full border ${
                  selectedTags.includes(tag)
                    ? 'bg-pink-400 border-pink-400'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <Text className={`text-sm ${selectedTags.includes(tag) ? 'text-black font-semibold' : 'text-white/60'}`}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Gift Amount */}
        <View className="mb-6">
          <Text className="text-white/40 text-xs mb-2">축의금</Text>
          <View className="flex-row flex-wrap gap-2 mb-2">
            {[50000, 100000, 150000, 200000].map((amount) => (
              <TouchableOpacity
                key={amount}
                onPress={() => setGiftAmount(String(amount))}
                accessibilityRole="button"
                accessibilityLabel={`${amount.toLocaleString('ko-KR')}원`}
                className={`px-3 py-1.5 rounded-full border ${
                  giftAmount === String(amount)
                    ? 'bg-pink-400 border-pink-400'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <Text className={`text-xs font-semibold ${giftAmount === String(amount) ? 'text-black' : 'text-white/50'}`}>
                  {(amount / 10000).toLocaleString('ko-KR')}만
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View className="flex-row items-center gap-2">
            <TextInput
              value={giftAmount}
              onChangeText={(v) => setGiftAmount(v.replace(/[^0-9]/g, ''))}
              placeholder="0"
              placeholderTextColor="#ffffff33"
              keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base"
            />
            <Text className="text-white/40 text-sm">원</Text>
          </View>
          {giftAmount ? (
            <Text className="text-white/30 text-xs mt-1">
              {Number(giftAmount).toLocaleString('ko-KR')}원
            </Text>
          ) : null}
        </View>

        {/* Photos */}
        <View className="mb-8">
          <Text className="text-white/40 text-xs mb-3">사진 (최대 3장)</Text>
          <View className="flex-row flex-wrap gap-3">
            {photos.map((p) => (
              <PhotoCard
                key={p.id}
                photo={{ ...p, signedUrl: photoUrls[p.id] }}
                onDelete={() => removePhoto.mutate({ photoId: p.id, storagePath: p.storage_path })}
              />
            ))}
            {photos.length < 3 && (
              <TouchableOpacity
                onPress={() => Alert.alert('사진 추가', '', [
                  { text: '카메라로 촬영', onPress: () => addPhoto.mutate('camera') },
                  { text: '갤러리에서 선택', onPress: () => addPhoto.mutate('library') },
                  { text: '취소', style: 'cancel' },
                ])}
                disabled={addPhoto.isPending}
                accessibilityRole="button"
                accessibilityLabel="사진 추가"
                className="w-28 h-28 rounded-2xl border border-dashed border-white/20 items-center justify-center"
              >
                {addPhoto.isPending
                  ? <ActivityIndicator color={BRAND_PINK} size="small" />
                  : <Text className="text-white/30 text-3xl">+</Text>}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Save Memory */}
        <TouchableOpacity
          onPress={() => saveMemory.mutate()}
          disabled={saveMemory.isPending || justSaved}
          accessibilityRole="button"
          accessibilityLabel="기억 저장"
          className={`rounded-xl py-4 items-center ${justSaved ? 'bg-lime-400' : 'bg-pink-400'}`}
        >
          {saveMemory.isPending
            ? <ActivityIndicator color="#000" />
            : <Text className="text-black font-bold text-base">{justSaved ? '저장됨 ✓' : '기억 저장'}</Text>}
        </TouchableOpacity>
      </ScrollView>

      <ConfirmModal
        visible={showDeleteConfirm}
        title="삭제"
        message="이 결혼식을 삭제할까요? 사진과 기억도 함께 삭제됩니다."
        confirmLabel="삭제"
        onConfirm={confirmDeleteWedding}
        onCancel={() => setShowDeleteConfirm(false)}
        destructive
      />
    </KeyboardAvoidingView>
  );
}
