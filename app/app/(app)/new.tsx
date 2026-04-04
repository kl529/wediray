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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createWedding, updateWedding, getWedding, formatDateKR, formatTimeKR, type Attendance,
} from '../../lib/db';
import { BRAND_PINK } from '../../lib/constants';
import { supabase } from '../../lib/supabase';
import { pickAndOcr, parseOcrText } from '../../lib/ocr';
import { addWeddingToCalendar } from '../../lib/calendar';

const ATTENDANCE_OPTIONS: { value: Attendance; label: string }[] = [
  { value: 'attending', label: '참석' },
  { value: 'absent', label: '불참' },
  { value: 'pending', label: '미정' },
];

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
  const [scanning, setScanning] = useState<'camera' | 'gallery' | null>(null);
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
        router.back();
        return;
      }
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const wDate = new Date(dateObjToString(dateObj) + 'T00:00:00');
      if (wDate >= today) {
        setShowCalendarModal(true);
      } else {
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

  async function handleScan(source: 'camera' | 'gallery') {
    setScanning(source);
    try {
      const text = await pickAndOcr(source);
      if (!text) return;
      const parsed = parseOcrText(text);
      if (parsed.groom && !groom.trim()) setGroom(parsed.groom);
      if (parsed.bride && !bride.trim()) setBride(parsed.bride);
      if (parsed.date) setDateObj(new Date(parsed.date + 'T00:00:00'));
      if (parsed.venue && !venue.trim()) setVenue(parsed.venue);
      if (!parsed.groom && !parsed.bride && !parsed.date && !parsed.venue) {
        Alert.alert('인식 실패', '청첩장 텍스트를 찾지 못했습니다. 직접 입력해주세요.');
      }
    } catch {
      Alert.alert('스캔 실패', '직접 입력해주세요.');
    } finally {
      setScanning(null);
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

      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        {/* Inline error banner */}
        {formError ? (
          <View className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 mb-4">
            <Text className="text-red-400 text-sm">{formError}</Text>
          </View>
        ) : null}

        {/* Invitation URL + OCR */}
        <View className="mb-6">
          <Text className="text-white/40 text-xs mb-2">자동 입력</Text>
          {/* URL row */}
          <View className="flex-row gap-2 mb-2">
            <TextInput
              value={inviteUrl}
              onChangeText={setInviteUrl}
              placeholder="청첩장 링크 붙여넣기..."
              placeholderTextColor="#ffffff33"
              autoCapitalize="none"
              keyboardType="url"
              className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm"
            />
            <TouchableOpacity
              onPress={handleParse}
              disabled={parsing || !inviteUrl.trim()}
              accessibilityRole="button"
              accessibilityLabel="불러오기"
              className={`rounded-xl px-4 items-center justify-center ${parsing || !inviteUrl.trim() ? 'bg-pink-400/40' : 'bg-pink-400'}`}
            >
              {parsing
                ? <ActivityIndicator color="#000" size="small" />
                : <Text className={`font-bold text-sm ${parsing || !inviteUrl.trim() ? 'text-black/40' : 'text-black'}`}>불러오기</Text>}
            </TouchableOpacity>
          </View>
          {/* OCR row — native only */}
          {Platform.OS !== 'web' && (
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => handleScan('camera')}
                disabled={scanning !== null}
                accessibilityRole="button"
                accessibilityLabel="카메라로 촬영"
                className="flex-1 items-center justify-center bg-white/5 border border-white/20 rounded-xl py-3"
              >
                {scanning === 'camera'
                  ? <ActivityIndicator color={BRAND_PINK} size="small" />
                  : <Text className="text-white/60 text-sm">카메라 촬영</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleScan('gallery')}
                disabled={scanning !== null}
                accessibilityRole="button"
                accessibilityLabel="갤러리에서 선택"
                className="flex-1 items-center justify-center bg-white/5 border border-white/20 rounded-xl py-3"
              >
                {scanning === 'gallery'
                  ? <ActivityIndicator color={BRAND_PINK} size="small" />
                  : <Text className="text-white/60 text-sm">갤러리 선택</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="h-px bg-white/10 mb-6" />

        {/* Groom */}
        <View className="mb-4">
          <View className="flex-row items-center mb-2">
            <Text className="text-white/40 text-xs">신랑</Text>
            <Text className="text-red-400 text-xs ml-0.5">*</Text>
          </View>
          <TextInput
            value={groom}
            onChangeText={(v) => { setGroom(v); if (nameError) setNameError(false); if (formError) setFormError(''); }}
            placeholder="이름"
            placeholderTextColor="#ffffff33"
            className={`bg-white/5 border rounded-xl px-4 py-3 text-white text-base ${nameError && !groom.trim() ? 'border-red-500' : 'border-white/20'}`}
          />
        </View>

        {/* Bride */}
        <View className="mb-4">
          <View className="flex-row items-center mb-2">
            <Text className="text-white/40 text-xs">신부</Text>
            <Text className="text-red-400 text-xs ml-0.5">*</Text>
          </View>
          <TextInput
            value={bride}
            onChangeText={(v) => { setBride(v); if (nameError) setNameError(false); if (formError) setFormError(''); }}
            placeholder="이름"
            placeholderTextColor="#ffffff33"
            className={`bg-white/5 border rounded-xl px-4 py-3 text-white text-base ${nameError && !bride.trim() ? 'border-red-500' : 'border-white/20'}`}
          />
        </View>

        {/* Date */}
        <View className="mb-4">
          <Text className="text-white/40 text-xs mb-2">날짜</Text>
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
                className="bg-white/5 border border-white/20 rounded-xl px-4 py-3"
              >
                <Text className="text-white text-base">{formatDateKR(dateObjToString(dateObj))}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dateObj}
                  mode="date"
                  display="default"
                  onChange={(_, d) => {
                    setShowDatePicker(false);
                    if (d) setDateObj(d);
                  }}
                />
              )}
            </>
          )}
        </View>

        {/* Time */}
        <View className="mb-4">
          <Text className="text-white/40 text-xs mb-2">시간</Text>
          <View className="flex-row items-center gap-2">
            {Platform.OS === 'ios' ? (
              showTime ? (
                <DateTimePicker
                  value={timeObj}
                  mode="time"
                  display="compact"
                  onChange={(_, d) => { if (d) setTimeObj(d); }}
                  themeVariant="dark"
                  style={{ alignSelf: 'flex-start', marginLeft: -8 }}
                />
              ) : (
                <TouchableOpacity
                  onPress={() => setShowTime(true)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                >
                  <Text className="text-white/30 text-base">시간 없음</Text>
                </TouchableOpacity>
              )
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => { setShowTime(true); setShowTimePicker(true); }}
                  className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3"
                >
                  <Text className={`text-base ${showTime ? 'text-white' : 'text-white/30'}`}>
                    {showTime ? formatTimeKR(timeObjToString(timeObj)) : '시간 없음'}
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
            {showTime && (
              <TouchableOpacity onPress={() => setShowTime(false)} className="p-1">
                <Ionicons name="close-circle-outline" size={20} color="rgba(255,255,255,0.3)" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Venue */}
        <View className="mb-6">
          <Text className="text-white/40 text-xs mb-2">장소</Text>
          <TextInput
            value={venue}
            onChangeText={(v) => { setVenue(v); if (formError) setFormError(''); }}
            placeholder="웨딩홀 이름"
            placeholderTextColor="#ffffff33"
            className="bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-base"
          />
        </View>

        {/* Attendance */}
        <View>
          <Text className="text-white/40 text-xs mb-2">참석 여부</Text>
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
                    ? 'bg-pink-400 border-pink-400'
                    : 'bg-white/5 border-white/20'
                }`}
              >
                <Text className={`font-semibold text-sm ${attendance === opt.value ? 'text-black' : 'text-white/50'}`}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
          router.back();
        }}
        onCancel={() => {
          setShowCalendarModal(false);
          router.back();
        }}
      />
    </KeyboardAvoidingView>
  );
}
