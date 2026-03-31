import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import {
  getWedding, getMemory, getPhotos, upsertMemory,
  uploadPhoto, deletePhoto, deleteWedding, deleteWeddingPhotos,
  getPhotoUrl, formatDateKR, type Photo,
} from '../../lib/db';

const EMOTION_TAGS = ['행복해 😊', '감동받았어 🥹', '설렜어 💕', '즐거웠어 🎉', '뭉클했어 💧', '배고팠어 🍽️'];
const ATTENDANCE_LABEL: Record<string, string> = { attending: '참석', absent: '불참', pending: '미정' };
const ATTENDANCE_COLOR: Record<string, string> = {
  attending: 'bg-lime-400',
  absent: 'bg-white/20',
  pending: 'bg-sky-400',
};

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
          <ActivityIndicator color="#FF69B4" size="small" />
        </View>
      )}
      <TouchableOpacity
        onPress={onDelete}
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
  const { data: photos = [] } = useQuery({
    queryKey: ['photos', id],
    queryFn: () => getPhotos(id),
  });

  const [memo, setMemo] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [giftAmount, setGiftAmount] = useState('');
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (memory) {
      setMemo(memory.memo ?? '');
      setSelectedTags(memory.emotion_tags ?? []);
      setGiftAmount(memory.gift_amount ? String(memory.gift_amount) : '');
    }
  }, [memory]);

  // Load signed URLs for photos
  useEffect(() => {
    const newPhotos = photos.filter((p) => !photoUrls[p.id]);
    if (newPhotos.length === 0) return;
    Promise.all(
      newPhotos.map((p) => getPhotoUrl(p.storage_path).then((url) => ({ id: p.id, url })))
    )
      .then((results) => {
        const updates = Object.fromEntries(results.map(({ id, url }) => [id, url]));
        setPhotoUrls((prev) => ({ ...prev, ...updates }));
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
      Alert.alert('저장됨 ✓');
    },
    onError: (e: Error) => Alert.alert('저장 실패', e.message),
  });

  const addPhoto = useMutation({
    mutationFn: async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
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

  function handleDeleteWedding() {
    Alert.alert('삭제', '이 결혼식을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteWeddingPhotos(id);
            await deleteWedding(id);
            qc.invalidateQueries({ queryKey: ['weddings'] });
            router.back();
          } catch (e: any) {
            Alert.alert('삭제 실패', e.message);
          }
        },
      },
    ]);
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  if (wLoading || !wedding) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#FF69B4" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-black"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-16 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-white/50 text-base">← 뒤로</Text>
        </TouchableOpacity>
        <View className="flex-row gap-4">
          <TouchableOpacity onPress={() => router.push(`/(app)/new?id=${id}`)}>
            <Text className="text-sky-400 text-sm">편집</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteWedding}>
            <Text className="text-white/30 text-sm">삭제</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        {/* Wedding Info */}
        <View className="mb-8">
          <Text className="text-white text-3xl font-bold mb-1">
            {wedding.groom} ♥ {wedding.bride}
          </Text>
          <Text className="text-white/50 text-base mb-1">{formatDateKR(wedding.date)}</Text>
          <Text className="text-white/30 text-sm mb-3">{wedding.venue}</Text>
          <View className={`self-start px-3 py-1 rounded-full ${ATTENDANCE_COLOR[wedding.attendance]}`}>
            <Text className="text-black text-xs font-bold">{ATTENDANCE_LABEL[wedding.attendance]}</Text>
          </View>
        </View>

        <View className="h-px bg-white/10 mb-8" />

        {/* Memory Section */}
        <Text className="text-white/40 text-xs uppercase tracking-widest mb-4">기억 기록</Text>

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
          <View className="flex-row items-center gap-2">
            <TextInput
              value={giftAmount}
              onChangeText={setGiftAmount}
              placeholder="0"
              placeholderTextColor="#ffffff33"
              keyboardType="numeric"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base"
            />
            <Text className="text-white/40 text-sm">원</Text>
          </View>
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
                onPress={() => addPhoto.mutate()}
                disabled={addPhoto.isPending}
                className="w-28 h-28 rounded-2xl border border-dashed border-white/20 items-center justify-center"
              >
                {addPhoto.isPending
                  ? <ActivityIndicator color="#FF69B4" size="small" />
                  : <Text className="text-white/30 text-3xl">+</Text>}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Save Memory */}
        <TouchableOpacity
          onPress={() => saveMemory.mutate()}
          disabled={saveMemory.isPending}
          className="bg-pink-400 rounded-xl py-4 items-center"
        >
          {saveMemory.isPending
            ? <ActivityIndicator color="#000" />
            : <Text className="text-black font-bold text-base">기억 저장</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
