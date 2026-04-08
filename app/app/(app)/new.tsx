import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ConfirmModal } from '../../components/ConfirmModal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import Head from 'expo-router/head';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createWedding, updateWedding, getWedding, formatDateKR, formatTimeKR, type Attendance,
} from '../../lib/db';
import { BRAND_PINK } from '../../lib/constants';
import { supabase } from '../../lib/supabase';
import { addWeddingToCalendar } from '../../lib/calendar';
import { toast } from '../../lib/toast';

const ATTENDANCE_OPTIONS: { value: Attendance; label: string }[] = [
  { value: 'attending', label: '참석' },
  { value: 'absent', label: '불참' },
  { value: 'pending', label: '미정' },
];

function SectionCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="bg-[#111] border border-[#2A2A2A] rounded-2xl p-4 mb-3">
      <Text className="text-white/40 text-[11px] font-semibold mb-3">{label}</Text>
      {children}
    </View>
  );
}

export default function NewEventScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const qc = useQueryClient();
  const isEdit = !!id;

  const [groom, setGroom] = useState('');
  const [bride, setBride] = useState('');
  const [dateObj, setDateObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [timeObj, setTimeObj] = useState(() => { const d = new Date(); d.setHours(11, 0, 0, 0); return d; });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [venue, setVenue] = useState('');
  const [attendance, setAttendance] = useState<Attendance>('pending');
  const [inviteUrl, setInviteUrl] = useState('');
  const [parsing, setParsing] = useState(false);
  const [formError, setFormError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const confirmedCancel = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  const { data: existing } = useQuery({
    queryKey: ['wedding', id],
    queryFn: () => getWedding(id!),
    enabled: isEdit,
  });

  function dateObjToString(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function timeObjToString(d: Date) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  useEffect(() => {
    if (existing) {
      setGroom(existing.groom);
      setBride(existing.bride);
      setDateObj(new Date(existing.date + 'T00:00:00'));
      setVenue(existing.venue);
      setAttendance(existing.attendance);
      setInviteUrl(existing.invite_url || '');
      if (existing.time) {
        setShowTime(true);
        const [h, m] = existing.time.split(':').map(Number);
        const d = new Date(); d.setHours(h, m, 0, 0);
        setTimeObj(d);
      }
    }
  }, [existing]);

  const isDirty = isEdit
    ? groom !== (existing?.groom ?? '') ||
      bride !== (existing?.bride ?? '') ||
      venue !== (existing?.venue ?? '') ||
      inviteUrl !== (existing?.invite_url ?? '') ||
      attendance !== (existing?.attendance ?? 'pending') ||
      dateObjToString(dateObj) !== (existing?.date ?? '') ||
      (showTime ? timeObjToString(timeObj) : null) !== (existing?.time ?? null)
    : groom.trim() !== '' || bride.trim() !== '' || venue.trim() !== '' || inviteUrl.trim() !== '';

  const mutation = useMutation({
    mutationFn: () => {
      const date = dateObjToString(dateObj);
      const time = showTime ? timeObjToString(timeObj) : null;
      const invite_url = inviteUrl.trim() || null;
      return isEdit
        ? updateWedding(id!, { groom, bride, date, time, venue, attendance, invite_url })
        : createWedding({ groom, bride, date, time, venue, attendance, invite_url });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['weddings'] });
      if (isEdit) {
        qc.invalidateQueries({ queryKey: ['wedding', id] });
        toast.show('수정됐어요');
        router.back();
        return;
      }
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const wDate = new Date(dateObjToString(dateObj) + 'T00:00:00');
      if (wDate >= today) {
        setShowCalendarModal(true);
      } else {
        confirmedCancel.current = true;
        toast.show('등록됐어요');
        router.back();
      }
    },
    onError: (e: Error) => {
      setFormError(`저장 실패: ${e.message}`);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    },
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove' as any, (e: any) => {
      if (!isDirty || mutation.isPending || confirmedCancel.current) return;
      e.preventDefault();
      Alert.alert('저장하지 않은 변경사항', '나가면 입력한 내용이 사라져요.', [
        { text: '계속 편집', style: 'cancel' },
        { text: '나가기', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
      ]);
    });
    return unsubscribe;
  }, [navigation, isDirty, mutation.isPending]);

  function handleCancel() {
    if (isDirty) {
      setShowCancelConfirm(true);
    } else {
      router.back();
    }
  }


  async function handleParse() {
    const url = inviteUrl.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      Alert.alert('올바르지 않은 URL', 'http:// 또는 https://로 시작하는 링크를 입력해주세요.');
      return;
    }
    setParsing(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-invitation', {
        body: { url },
      });
      if (error) throw error;
      if (data.groom && !groom.trim()) setGroom(data.groom);
      if (data.bride && !bride.trim()) setBride(data.bride);
      if (data.date) setDateObj(new Date(data.date + 'T00:00:00'));
      if (data.venue && !venue.trim()) setVenue(data.venue);
      if (!data.groom && !data.bride && !data.date && !data.venue) {
        Alert.alert('파싱 실패', '정보를 찾지 못했습니다. 직접 입력해주세요.');
      }
    } catch {
      Alert.alert('파싱 실패', '직접 입력해주세요.');
    } finally {
      setParsing(false);
    }
  }

  const [nameError, setNameError] = useState(false);

  function handleSave() {
    if (!groom.trim() && !bride.trim()) {
      setNameError(true);
      setFormError('신랑 또는 신부 이름을 입력해주세요.');
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setNameError(false);
    setFormError('');
    mutation.mutate();
  }

  return (
    <>
    <Head>
      <title>{isEdit ? '결혼식 수정' : '새 결혼식'} — wediary</title>
      <meta name="robots" content="noindex, nofollow" />
    </Head>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-black"
    >
      <ScreenHeader
        left={
          <TouchableOpacity
            onPress={handleCancel}
            accessibilityRole="button"
            accessibilityLabel="취소"
            className="py-2"
          >
            <Text className="text-white/50 text-base">취소</Text>
          </TouchableOpacity>
        }
        center={
          <Text className="text-white font-semibold text-base">
            {isEdit ? '결혼식 수정' : '새 결혼식'}
          </Text>
        }
        right={
          <TouchableOpacity
            onPress={handleSave}
            disabled={mutation.isPending}
            accessibilityRole="button"
            accessibilityLabel="저장"
            className="py-2"
          >
            {mutation.isPending
              ? <ActivityIndicator color={BRAND_PINK} size="small" />
              : <Text className="text-pink-400 font-bold text-base">저장</Text>}
          </TouchableOpacity>
        }
      />

      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {/* Inline error banner */}
        {formError ? (
          <View className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 mb-3">
            <Text className="text-red-400 text-sm">{formError}</Text>
          </View>
        ) : null}

        {/* ── 섹션 1: 청첩장 URL ── */}
        <SectionCard label="청첩장 URL">
          <View className="flex-row gap-2">
            <TextInput
              value={inviteUrl}
              onChangeText={setInviteUrl}
              placeholder="청첩장 링크 붙여넣기..."
              placeholderTextColor="#ffffff33"
              autoCapitalize="none"
              keyboardType="url"
              className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white text-sm"
            />
            <TouchableOpacity
              onPress={handleParse}
              disabled={parsing || !inviteUrl.trim()}
              accessibilityRole="button"
              accessibilityLabel="불러오기"
              className={`rounded-xl px-4 items-center justify-center ${parsing || !inviteUrl.trim() ? 'bg-pink-400/30' : 'bg-pink-400/20 border border-pink-400/40'}`}
            >
              {parsing
                ? <ActivityIndicator color={BRAND_PINK} size="small" />
                : <Text className={`font-bold text-sm ${parsing || !inviteUrl.trim() ? 'text-white/20' : 'text-pink-400'}`}>불러오기</Text>}
            </TouchableOpacity>
          </View>
        </SectionCard>

        {/* ── 섹션 2: 기본 정보 ── */}
        <SectionCard label="기본 정보">
          {/* 신랑 */}
          <View className="mb-3">
            <View className="flex-row items-center mb-1.5">
              <Text className="text-white/40 text-xs">신랑</Text>
              <Text className="text-pink-400 text-xs ml-0.5">*</Text>
            </View>
            <TextInput
              value={groom}
              onChangeText={(v) => { setGroom(v); if (nameError) setNameError(false); if (formError) setFormError(''); }}
              placeholder="이름"
              placeholderTextColor="#ffffff33"
              className={`bg-[#1A1A1A] border rounded-xl px-4 py-3 text-white text-base ${nameError && !groom.trim() ? 'border-red-500' : 'border-[#2A2A2A]'}`}
            />
          </View>

          {/* 신부 */}
          <View className="mb-3">
            <View className="flex-row items-center mb-1.5">
              <Text className="text-white/40 text-xs">신부</Text>
              <Text className="text-pink-400 text-xs ml-0.5">*</Text>
            </View>
            <TextInput
              value={bride}
              onChangeText={(v) => { setBride(v); if (nameError) setNameError(false); if (formError) setFormError(''); }}
              placeholder="이름"
              placeholderTextColor="#ffffff33"
              className={`bg-[#1A1A1A] border rounded-xl px-4 py-3 text-white text-base ${nameError && !bride.trim() ? 'border-red-500' : 'border-[#2A2A2A]'}`}
            />
          </View>

          {/* 날짜 + 시간 — 한 row */}
          <View className="flex-row gap-2 mb-3">
            <View className="flex-1">
              <Text className="text-white/40 text-xs mb-1.5">날짜</Text>
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={dateObj}
                  mode="date"
                  display="compact"
                  onChange={(_, d) => { if (d) setDateObj(d); }}
                  themeVariant="dark"
                  style={{ alignSelf: 'flex-start', marginLeft: -8 }}
                />
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3"
                  >
                    <Text className="text-white text-sm">{formatDateKR(dateObjToString(dateObj))}</Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={dateObj}
                      mode="date"
                      display="default"
                      onChange={(_, d) => { setShowDatePicker(false); if (d) setDateObj(d); }}
                    />
                  )}
                </>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-white/40 text-xs mb-1.5">시간</Text>
              {Platform.OS === 'web' ? (
                <View className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 flex-row items-center">
                  {showTime ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      {/* @ts-ignore */}
                      <input
                        type="time"
                        value={timeObjToString(timeObj)}
                        onChange={(e: any) => {
                          if (e.target.value) {
                            const [h, m] = e.target.value.split(':').map(Number);
                            const d = new Date(timeObj);
                            d.setHours(h, m, 0, 0);
                            setTimeObj(d);
                          }
                        }}
                        style={{ background: 'transparent', border: 'none', color: 'white', fontSize: 14, outline: 'none' }}
                      />
                      <TouchableOpacity onPress={() => setShowTime(false)} className="p-1">
                        <Ionicons name="close-circle-outline" size={18} color="rgba(255,255,255,0.3)" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => setShowTime(true)}>
                      <Text className="text-white/30 text-sm">없음</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : Platform.OS === 'ios' ? (
                showTime ? (
                  <View className="flex-row items-center gap-1">
                    <DateTimePicker
                      value={timeObj}
                      mode="time"
                      display="compact"
                      onChange={(_, d) => { if (d) setTimeObj(d); }}
                      themeVariant="dark"
                      style={{ alignSelf: 'flex-start', marginLeft: -8 }}
                    />
                    <TouchableOpacity onPress={() => setShowTime(false)} className="p-1">
                      <Ionicons name="close-circle-outline" size={18} color="rgba(255,255,255,0.3)" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setShowTime(true)}
                    className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3"
                  >
                    <Text className="text-white/30 text-sm">없음</Text>
                  </TouchableOpacity>
                )
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => { setShowTime(true); setShowTimePicker(true); }}
                    className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3"
                  >
                    <Text className={`text-sm ${showTime ? 'text-white' : 'text-white/30'}`}>
                      {showTime ? formatTimeKR(timeObjToString(timeObj)) : '없음'}
                    </Text>
                  </TouchableOpacity>
                  {showTimePicker && (
                    <DateTimePicker
                      value={timeObj}
                      mode="time"
                      display="spinner"
                      onChange={(_, d) => {
                        setShowTimePicker(false);
                        if (d) { setTimeObj(d); setShowTime(true); }
                      }}
                    />
                  )}
                </>
              )}
            </View>
          </View>

          {/* 장소 */}
          <View>
            <Text className="text-white/40 text-xs mb-1.5">장소</Text>
            <TextInput
              value={venue}
              onChangeText={(v) => { setVenue(v); if (formError) setFormError(''); }}
              placeholder="웨딩홀 이름"
              placeholderTextColor="#ffffff33"
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white text-base"
            />
          </View>
        </SectionCard>

        {/* ── 섹션 3: 참석 여부 ── */}
        <SectionCard label="참석 여부">
          <View className="flex-row gap-2">
            {ATTENDANCE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setAttendance(opt.value)}
                accessibilityRole="radio"
                accessibilityLabel={opt.label}
                accessibilityState={{ selected: attendance === opt.value }}
                className={`flex-1 py-3 rounded-xl items-center border ${
                  attendance === opt.value
                    ? opt.value === 'attending'
                      ? 'bg-lime-400/15 border-lime-400'
                      : opt.value === 'absent'
                        ? 'bg-pink-400/15 border-pink-400'
                        : 'bg-white/15 border-white/30'
                    : 'bg-[#1A1A1A] border-[#2A2A2A]'
                }`}
              >
                <Text className={`font-semibold text-sm ${
                  attendance === opt.value
                    ? opt.value === 'attending' ? 'text-lime-400'
                    : opt.value === 'absent' ? 'text-pink-400'
                    : 'text-white/70'
                    : 'text-white/30'
                }`}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SectionCard>
      </ScrollView>

      <ConfirmModal
        visible={showCancelConfirm}
        title="입력 취소"
        message="입력한 내용이 저장되지 않아요. 취소하시겠어요?"
        confirmLabel="나가기"
        onConfirm={() => {
          setShowCancelConfirm(false);
          confirmedCancel.current = true;
          router.back();
        }}
        onCancel={() => setShowCancelConfirm(false)}
        destructive
      />

      <ConfirmModal
        visible={showCalendarModal}
        title="캘린더에 추가할까요?"
        message="저장된 결혼식 일정을 기기 캘린더에 추가할 수 있어요."
        confirmLabel="추가"
        cancelLabel="건너뛰기"
        onConfirm={async () => {
          setShowCalendarModal(false);
          try {
            await addWeddingToCalendar({
              groom,
              bride,
              date: dateObjToString(dateObj),
              venue,
              time: showTime ? timeObjToString(timeObj) : undefined,
            });
          } catch {
            // 실패해도 그냥 넘어감
          }
          confirmedCancel.current = true;
          toast.show('등록됐어요');
          router.back();
        }}
        onCancel={() => {
          setShowCalendarModal(false);
          confirmedCancel.current = true;
          toast.show('등록됐어요');
          router.back();
        }}
      />
    </KeyboardAvoidingView>
    </>
  );
}
