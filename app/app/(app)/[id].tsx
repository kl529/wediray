import React, { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Linking,
} from 'react-native';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWedding, getMemory, upsertMemory,
  deleteWedding, updateWedding, formatDateKR, formatTimeKR, isUpcoming, type Attendance,
} from '../../lib/db';
import { BRAND_PINK, ATTENDANCE_LABEL, ATTENDANCE_PILL_BG, ATTENDANCE_PILL_TEXT } from '../../lib/constants';
import { addWeddingToCalendar } from '../../lib/calendar';

export default function EventDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: wedding, isLoading: wLoading, isError: wError } = useQuery({
    queryKey: ['wedding', id],
    queryFn: () => getWedding(id),
  });
  const { data: memory } = useQuery({
    queryKey: ['memory', id],
    queryFn: () => getMemory(id),
  });
  const [memo, setMemo] = useState('');
  const [giftAmount, setGiftAmount] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [calendarAdded, setCalendarAdded] = useState(false);
  const [venueCopied, setVenueCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [showAttendancePicker, setShowAttendancePicker] = useState(false);
  const bypassBeforeRemove = useRef(false);

  const updateAttendance = useMutation({
    mutationFn: (value: Attendance) => updateWedding(id, { attendance: value }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wedding', id] });
      qc.invalidateQueries({ queryKey: ['weddings'] });
    },
    onError: (e: Error) => Alert.alert('저장 실패', e.message),
  });

  useEffect(() => {
    if (memory) {
      setMemo(memory.memo ?? '');
      setGiftAmount(memory.gift_amount ? String(memory.gift_amount) : '');
    }
  }, [memory]);

  const saveMemory = useMutation({
    mutationFn: () =>
      upsertMemory(id, {
        memo: memo.trim() || undefined,
        gift_amount: giftAmount ? Number(giftAmount) : null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['memory', id] });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    },
    onError: (e: Error) => Alert.alert('저장 실패', e.message),
  });

  async function confirmDeleteWedding() {
    setShowDeleteConfirm(false);
    try {
      await deleteWedding(id);
      qc.invalidateQueries({ queryKey: ['weddings'] });
      router.back();
    } catch (e: any) {
      Alert.alert('삭제 실패', e.message);
    }
  }

  const isDirty =
    memo !== (memory?.memo ?? '') ||
    giftAmount !== (memory?.gift_amount ? String(memory.gift_amount) : '');

  // beforeRemove catches the native iOS swipe-back gesture.
  // bypassBeforeRemove is set when ConfirmModal already confirmed — avoids double-prompt.
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove' as any, (e: any) => {
      if (!isDirty || bypassBeforeRemove.current) return;
      e.preventDefault();
      Alert.alert('저장하지 않은 변경사항', '나가면 변경사항이 사라져요.', [
        { text: '계속 편집', style: 'cancel' },
        { text: '나가기', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
      ]);
    });
    return unsubscribe;
  }, [navigation, isDirty]);

  function handleBack() {
    if (isDirty) {
      setShowUnsavedConfirm(true);
    } else {
      router.back();
    }
  }

  if (wLoading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color={BRAND_PINK} />
      </View>
    );
  }

  if (wError || !wedding) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <Text className="text-4xl mb-3">😢</Text>
        <Text className="text-white/50 text-sm text-center">결혼식 정보를 불러오지 못했어요.{'\n'}잠시 후 다시 시도해주세요.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6">
          <Text className="text-pink-400 text-sm">돌아가기</Text>
        </TouchableOpacity>
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
            className="py-2 px-1"
          >
            <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        }
        center={
          wedding ? (
            <Text className="text-white font-semibold text-base" numberOfLines={1}>
              {wedding.groom} ♥ {wedding.bride}
            </Text>
          ) : undefined
        }
        right={
          <View className="flex-row gap-5 items-center">
            <TouchableOpacity
              onPress={() => router.push(`/(app)/new?id=${id}`)}
              accessibilityRole="button"
              accessibilityLabel="편집"
            >
              <Ionicons name="create-outline" size={22} color="#FF69B4" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDeleteConfirm(true)}
              accessibilityRole="button"
              accessibilityLabel="삭제"
            >
              <Ionicons name="trash-outline" size={22} color="rgba(255,255,255,0.35)" />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        {/* Wedding Info */}
        <View className="mb-6">
          <Text className="text-white text-3xl font-gaegu-bold mb-2">
            {wedding.groom} ♥ {wedding.bride}
          </Text>

          {/* Date + time row */}
          <View className="flex-row items-center gap-2 flex-wrap mb-1">
            <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.5)" />
            <Text className="text-white/60 text-sm">{formatDateKR(wedding.date)}</Text>
            {wedding.time ? (
              <Text className="text-white/60 text-sm">· {formatTimeKR(wedding.time)}</Text>
            ) : null}
            {(() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const wDate = new Date(wedding.date + 'T00:00:00');
              const diff = Math.round((wDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              if (diff === 0) return <Text className="text-pink-400 text-sm font-bold">D-Day</Text>;
              if (diff > 0) return <Text className="text-pink-400 text-sm font-bold">D-{diff}</Text>;
              return <Text className="text-white/30 text-sm">{-diff}일 전</Text>;
            })()}
          </View>

          {/* Venue row */}
          {wedding.venue ? (
            <View className="flex-row items-center gap-2 mb-4">
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.5)" />
              <Text className="text-white/60 text-sm flex-1">{wedding.venue}</Text>
              <TouchableOpacity
                onPress={async () => {
                  await Clipboard.setStringAsync(wedding.venue);
                  setVenueCopied(true);
                  setTimeout(() => setVenueCopied(false), 2000);
                }}
                accessibilityRole="button"
                accessibilityLabel="장소 복사"
                className="px-2 py-1"
              >
                {venueCopied
                  ? <Text className="text-lime-400 text-xs">복사됨 ✓</Text>
                  : <Ionicons name="copy-outline" size={14} color="rgba(255,255,255,0.35)" />}
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Attendance pill — 탭으로 인라인 변경 */}
          {showAttendancePicker ? (
            <View className="flex-row gap-2 mb-4">
              {(['attending', 'absent', 'pending'] as Attendance[]).map((value) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => {
                    updateAttendance.mutate(value);
                    setShowAttendancePicker(false);
                  }}
                  className={`px-3 py-1.5 rounded-full border ${
                    wedding.attendance === value
                      ? `${ATTENDANCE_PILL_BG[value]} border-transparent`
                      : 'bg-white/5 border-white/20'
                  }`}
                >
                  <Text className={`text-xs font-bold ${
                    wedding.attendance === value ? ATTENDANCE_PILL_TEXT[value] : 'text-white/50'
                  }`}>
                    {ATTENDANCE_LABEL[value]}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setShowAttendancePicker(false)} className="px-2 py-1.5">
                <Text className="text-white/30 text-xs">취소</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setShowAttendancePicker(true)}
              accessibilityRole="button"
              accessibilityLabel="참석 여부 변경"
              className={`self-start px-3 py-1 rounded-full mb-4 ${ATTENDANCE_PILL_BG[(ATTENDANCE_LABEL[wedding.attendance] ? wedding.attendance : 'pending') as Attendance]}`}
            >
              <Text className={`text-xs font-bold ${ATTENDANCE_PILL_TEXT[(ATTENDANCE_LABEL[wedding.attendance] ? wedding.attendance : 'pending') as Attendance]}`}>
                {ATTENDANCE_LABEL[(ATTENDANCE_LABEL[wedding.attendance] ? wedding.attendance : 'pending') as Attendance]}
              </Text>
            </TouchableOpacity>
          )}

          {/* Calendar CTA — 예정된 결혼식에만 표시 */}
          {isUpcoming(wedding) ? <TouchableOpacity
            onPress={async () => {
              try {
                await addWeddingToCalendar({
                  groom: wedding.groom,
                  bride: wedding.bride,
                  date: wedding.date,
                  venue: wedding.venue,
                  time: wedding.time,
                });
                setCalendarAdded(true);
                setTimeout(() => setCalendarAdded(false), 3000);
              } catch (e: any) {
                Alert.alert('추가 실패', e.message);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="캘린더에 추가"
            className={`flex-row items-center gap-3 px-4 py-3 rounded-xl border ${
              calendarAdded ? 'bg-lime-400/15 border-lime-400/30' : 'bg-white/5 border-white/10'
            }`}
          >
            <Ionicons
              name={calendarAdded ? 'checkmark-circle' : 'calendar'}
              size={20}
              color={calendarAdded ? '#a3e635' : '#f472b6'}
            />
            <Text className={`text-sm font-semibold flex-1 ${calendarAdded ? 'text-lime-400' : 'text-white/80'}`}>
              {calendarAdded ? '캘린더에 추가됨' : '캘린더에 추가'}
            </Text>
            {!calendarAdded && (
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
            )}
          </TouchableOpacity> : null}
        </View>

        {wedding.invite_url ? (
          <TouchableOpacity
            onPress={() => Linking.openURL(wedding.invite_url!)}
            onLongPress={async () => {
              await Clipboard.setStringAsync(wedding.invite_url!);
              setUrlCopied(true);
              setTimeout(() => setUrlCopied(false), 2000);
            }}
            accessibilityRole="link"
            accessibilityLabel="청첩장 링크 열기"
            className="mb-6 bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex-row items-center gap-2 active:opacity-70"
          >
            <Ionicons name="link-outline" size={16} color="rgba(255,255,255,0.4)" />
            <Text className="text-white/50 text-xs flex-1" numberOfLines={1}>{wedding.invite_url}</Text>
            <Text className={`text-xs ${urlCopied ? 'text-lime-400' : 'text-white/20'}`}>
              {urlCopied ? '복사됨 ✓' : '탭=열기'}
            </Text>
          </TouchableOpacity>
        ) : null}

        <View className="h-px bg-white/10 mb-8" />

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
                    : 'bg-white/10 border-white/20'
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
            : <Text className="text-black font-bold text-base">{justSaved ? '저장됨 ✓' : '저장'}</Text>}
        </TouchableOpacity>
      </ScrollView>

      <ConfirmModal
        visible={showDeleteConfirm}
        title="삭제"
        message="이 결혼식을 삭제할까요? 기억도 함께 삭제됩니다."
        confirmLabel="삭제"
        onConfirm={confirmDeleteWedding}
        onCancel={() => setShowDeleteConfirm(false)}
        destructive
      />
      <ConfirmModal
        visible={showUnsavedConfirm}
        title="저장하지 않은 변경사항"
        message="나가면 변경사항이 사라져요."
        confirmLabel="나가기"
        onConfirm={() => { bypassBeforeRemove.current = true; setShowUnsavedConfirm(false); router.back(); }}
        onCancel={() => setShowUnsavedConfirm(false)}
        destructive
      />
    </KeyboardAvoidingView>
  );
}
