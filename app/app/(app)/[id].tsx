import React, { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Head from 'expo-router/head';
import * as Clipboard from 'expo-clipboard';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Linking,
} from 'react-native';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWedding, getMemory, upsertMemory,
  deleteWedding, updateWedding, formatDateKR, formatTimeKR, isUpcoming, type Attendance,
} from '../../lib/db';
import { BRAND_PINK, ATTENDANCE_LABEL, ATTENDANCE_PILL_ACTIVE, ATTENDANCE_PILL_ACTIVE_TEXT } from '../../lib/constants';
import { toast } from '../../lib/toast';

export default function EventDetailScreen() {
  const router = useRouter();
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
  const [venueCopied, setVenueCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const memoRef = useRef('');
  const giftRef = useRef('');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateAttendance = useMutation({
    mutationFn: (value: Attendance) => updateWedding(id, { attendance: value }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wedding', id] });
      qc.invalidateQueries({ queryKey: ['weddings'] });
      toast.show('참석 여부 업데이트됐어요');
    },
    onError: (e: Error) => Alert.alert('저장 실패', e.message),
  });

  useEffect(() => {
    if (memory) {
      const m = memory.memo ?? '';
      const g = memory.gift_amount ? String(memory.gift_amount) : '';
      setMemo(m);
      setGiftAmount(g);
      memoRef.current = m;
      giftRef.current = g;
    }
  }, [memory]);

  const saveMemory = useMutation({
    mutationFn: () =>
      upsertMemory(id, {
        memo: memoRef.current.trim() || undefined,
        gift_amount: giftRef.current ? Number(giftRef.current) : null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['memory', id] });
      toast.show('저장됐어요');
    },
    onError: (e: Error) => Alert.alert('저장 실패', e.message),
  });

  useEffect(() => {
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, []);

  function scheduleSave() {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveMemory.mutate(), 1500);
  }

  function saveNow() {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveMemory.mutate();
  }

  async function confirmDeleteWedding() {
    setShowDeleteConfirm(false);
    try {
      await deleteWedding(id);
      qc.invalidateQueries({ queryKey: ['weddings'] });
      toast.show('삭제됐어요');
      router.back();
    } catch (e: any) {
      Alert.alert('삭제 실패', e.message);
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
        <Ionicons name="cloud-offline-outline" size={40} color="rgba(255,255,255,0.25)" style={{ marginBottom: 12 }} />
        <Text className="text-white/50 text-sm text-center">결혼식 정보를 불러오지 못했어요.{'\n'}잠시 후 다시 시도해주세요.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6">
          <Text className="text-pink-400 text-sm">돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const att = (ATTENDANCE_LABEL[wedding.attendance] ? wedding.attendance : 'pending') as Attendance;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const wDate = new Date(wedding.date + 'T00:00:00');
  const daysUntil = Math.round((wDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <>
    <Head>
      <title>{wedding.groom} ♥ {wedding.bride} — wediary</title>
      <meta name="robots" content="noindex, nofollow" />
    </Head>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-black"
    >
      <ScreenHeader
        left={
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            className="py-2 px-1"
          >
            <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        }
        center={
          <Text className="text-white font-semibold text-base" numberOfLines={1}>
            {wedding.groom} ♥ {wedding.bride}
          </Text>
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

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>

        {/* ── 웨딩 정보 카드 ── */}
        <View className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-5 mb-3">
          {/* 이름 */}
          <Text className="text-white text-3xl font-gaegu-bold mb-2">
            {wedding.groom} <Text className="text-pink-400">♥</Text> {wedding.bride}
          </Text>

          {/* D-day 배지 */}
          {daysUntil === 0 ? (
            <View className="self-start bg-pink-400 rounded-full px-3 py-0.5 mb-4">
              <Text className="text-white text-xs font-bold">D-Day</Text>
            </View>
          ) : daysUntil > 0 ? (
            <View className="self-start bg-pink-400/15 border border-pink-400/40 rounded-full px-3 py-0.5 mb-4">
              <Text className="text-pink-400 text-xs font-bold">D-{daysUntil}</Text>
            </View>
          ) : (
            <View className="self-start bg-white/5 border border-white/10 rounded-full px-3 py-0.5 mb-4">
              <Text className="text-white/30 text-xs">{Math.abs(daysUntil)}일 전</Text>
            </View>
          )}

          {/* 날짜 + 시간 */}
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="calendar-outline" size={15} color="#FF1493" />
            <Text className="text-pink-400 text-sm font-semibold">{formatDateKR(wedding.date)}</Text>
            {wedding.time ? (
              <Text className="text-white/50 text-sm">· {formatTimeKR(wedding.time)}</Text>
            ) : null}
          </View>

          {/* 장소 */}
          {wedding.venue ? (
            <TouchableOpacity
              onPress={async () => {
                await Clipboard.setStringAsync(wedding.venue);
                setVenueCopied(true);
                setTimeout(() => setVenueCopied(false), 2000);
              }}
              accessibilityRole="button"
              accessibilityLabel="장소 복사"
              className={`flex-row items-center gap-2 px-3 py-2.5 rounded-xl border ${
                venueCopied ? 'bg-lime-400/10 border-lime-400/30' : 'bg-black/30 border-white/10'
              }`}
            >
              <Ionicons name="location-outline" size={15} color={venueCopied ? '#CCFF00' : '#7EB8FF'} />
              <Text className={`text-sm flex-1 ${venueCopied ? 'text-lime-400' : 'text-[#7EB8FF]'}`}>
                {wedding.venue}
              </Text>
              {venueCopied
                ? <Text className="text-lime-400 text-xs font-semibold">복사됨 ✓</Text>
                : <Ionicons name="copy-outline" size={13} color="rgba(255,255,255,0.3)" />}
            </TouchableOpacity>
          ) : null}
        </View>

        {/* ── 참석 여부 ── */}
        <View className="bg-[#111] border border-[#2A2A2A] rounded-2xl p-4 mb-3">
          <Text className="text-white/40 text-[11px] font-semibold mb-3">참석 여부</Text>
          <View className="flex-row gap-2">
            {(['attending', 'absent', 'pending'] as Attendance[]).map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => updateAttendance.mutate(value)}
                disabled={updateAttendance.isPending}
                accessibilityRole="radio"
                accessibilityLabel={ATTENDANCE_LABEL[value]}
                accessibilityState={{ selected: att === value }}
                className={`flex-1 py-2 rounded-full border items-center ${
                  att === value
                    ? ATTENDANCE_PILL_ACTIVE[value]
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <Text className={`text-xs font-bold ${
                  att === value ? ATTENDANCE_PILL_ACTIVE_TEXT[value] : 'text-white/30'
                }`}>
                  {ATTENDANCE_LABEL[value]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── 청첩장 링크 ── */}
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
            className="mb-3 bg-[#111] border border-[#2A2A2A] rounded-2xl px-4 py-3 flex-row items-center gap-2 active:opacity-70"
          >
            <Text className="text-white/40 text-[11px] font-semibold w-16">URL</Text>
            <Text className="text-[#7EB8FF] text-xs flex-1" numberOfLines={1}>{wedding.invite_url}</Text>
            {urlCopied
              ? <Text className="text-lime-400 text-xs font-semibold">복사됨 ✓</Text>
              : <Ionicons name="open-outline" size={14} color="rgba(255,255,255,0.25)" />}
          </TouchableOpacity>
        ) : null}

        {/* ── 축의금 ── */}
        <View className="bg-[#111] border border-[#2A2A2A] rounded-2xl p-4 mb-3">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white/40 text-[11px] font-semibold">축의금</Text>
            <Text className="text-white/20 text-[10px]">자동 저장</Text>
          </View>
          <View className="flex-row gap-2 mb-3">
            {[50000, 100000, 150000, 200000].map((amount) => (
              <TouchableOpacity
                key={amount}
                onPress={() => { const v = String(amount); setGiftAmount(v); giftRef.current = v; scheduleSave(); }}
                accessibilityRole="button"
                accessibilityLabel={`${amount.toLocaleString('ko-KR')}원`}
                className={`flex-1 py-2 rounded-full border items-center ${
                  giftAmount === String(amount)
                    ? 'bg-pink-400/15 border-pink-400'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <Text className={`text-xs font-bold ${
                  giftAmount === String(amount) ? 'text-pink-400' : 'text-white/40'
                }`}>
                  {(amount / 10000)}만
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View className="flex-row items-center gap-2">
            <TextInput
              value={giftAmount}
              onChangeText={(v) => { const clean = v.replace(/[^0-9]/g, ''); setGiftAmount(clean); giftRef.current = clean; scheduleSave(); }}
              onBlur={saveNow}
              placeholder="0"
              placeholderTextColor="#ffffff33"
              keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
              className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white text-base"
            />
            <Text className="text-white/40 text-sm">원</Text>
          </View>
          {giftAmount ? (
            <Text className="text-white/30 text-xs mt-2">
              {Number(giftAmount).toLocaleString('ko-KR')}원
            </Text>
          ) : null}
        </View>

        {/* ── 메모 ── */}
        <View className="bg-[#111] border border-[#2A2A2A] rounded-2xl p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white/40 text-[11px] font-semibold">메모</Text>
            <Text className="text-white/20 text-[10px]">자동 저장</Text>
          </View>
          <TextInput
            value={memo}
            onChangeText={(v) => { setMemo(v); memoRef.current = v; scheduleSave(); }}
            onBlur={saveNow}
            placeholder="이날의 기억을 한 줄로..."
            placeholderTextColor="#ffffff33"
            multiline
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white text-sm min-h-20"
            style={{ textAlignVertical: 'top' }}
          />
        </View>

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
    </KeyboardAvoidingView>
    </>
  );
}
