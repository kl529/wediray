import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createWedding, updateWedding, getWedding, type Attendance,
} from '../../lib/db';
import { supabase } from '../../lib/supabase';

const ATTENDANCE_OPTIONS: { value: Attendance; label: string }[] = [
  { value: 'attending', label: '참석' },
  { value: 'absent', label: '불참' },
  { value: 'pending', label: '미정' },
];

export default function NewEventScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const qc = useQueryClient();
  const isEdit = !!id;

  const [groom, setGroom] = useState('');
  const [bride, setBride] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [attendance, setAttendance] = useState<Attendance>('pending');
  const [inviteUrl, setInviteUrl] = useState('');
  const [parsing, setParsing] = useState(false);

  const { data: existing } = useQuery({
    queryKey: ['wedding', id],
    queryFn: () => getWedding(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      setGroom(existing.groom);
      setBride(existing.bride);
      setDate(existing.date);
      setVenue(existing.venue);
      setAttendance(existing.attendance);
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? updateWedding(id!, { groom, bride, date, venue, attendance })
        : createWedding({ groom, bride, date, venue, attendance }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['weddings'] });
      if (isEdit) qc.invalidateQueries({ queryKey: ['wedding', id] });
      router.back();
    },
    onError: (e: Error) => Alert.alert('저장 실패', e.message),
  });

  async function handleParse() {
    if (!inviteUrl.trim()) return;
    setParsing(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-invitation', {
        body: { url: inviteUrl.trim() },
      });
      if (error) throw error;
      if (data.groom) setGroom(data.groom);
      if (data.bride) setBride(data.bride);
      if (data.date) setDate(data.date);
      if (data.venue) setVenue(data.venue);
    } catch {
      Alert.alert('파싱 실패', '직접 입력해주세요.');
    } finally {
      setParsing(false);
    }
  }

  function handleSave() {
    if (!groom.trim() || !bride.trim() || !date.trim() || !venue.trim()) {
      Alert.alert('입력 확인', '모든 항목을 채워주세요.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert('날짜 형식', 'YYYY-MM-DD 형식으로 입력해주세요.\n예: 2026-05-24');
      return;
    }
    mutation.mutate();
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-black"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-16 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-white/50 text-base">취소</Text>
        </TouchableOpacity>
        <Text className="text-white font-bold text-base">
          {isEdit ? '결혼식 수정' : '새 결혼식'}
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={mutation.isPending}>
          {mutation.isPending
            ? <ActivityIndicator color="#FF69B4" size="small" />
            : <Text className="text-pink-400 font-bold text-base">저장</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        {/* Invitation URL (Phase 4) */}
        <View className="mb-6">
          <Text className="text-white/40 text-xs mb-2 uppercase tracking-widest">청첩장 링크로 자동 입력</Text>
          <View className="flex-row gap-2">
            <TextInput
              value={inviteUrl}
              onChangeText={setInviteUrl}
              placeholder="https://..."
              placeholderTextColor="#ffffff33"
              autoCapitalize="none"
              keyboardType="url"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
            />
            <TouchableOpacity
              onPress={handleParse}
              disabled={parsing || !inviteUrl.trim()}
              className="bg-sky-400 rounded-xl px-4 items-center justify-center"
            >
              {parsing
                ? <ActivityIndicator color="#000" size="small" />
                : <Text className="text-black font-bold text-sm">불러오기</Text>}
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-px bg-white/10 mb-6" />

        {/* Groom */}
        <View className="mb-4">
          <Text className="text-white/40 text-xs mb-2 uppercase tracking-widest">신랑</Text>
          <TextInput
            value={groom}
            onChangeText={setGroom}
            placeholder="이름"
            placeholderTextColor="#ffffff33"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base"
          />
        </View>

        {/* Bride */}
        <View className="mb-4">
          <Text className="text-white/40 text-xs mb-2 uppercase tracking-widest">신부</Text>
          <TextInput
            value={bride}
            onChangeText={setBride}
            placeholder="이름"
            placeholderTextColor="#ffffff33"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base"
          />
        </View>

        {/* Date */}
        <View className="mb-4">
          <Text className="text-white/40 text-xs mb-2 uppercase tracking-widest">날짜</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#ffffff33"
            keyboardType="numbers-and-punctuation"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base"
          />
        </View>

        {/* Venue */}
        <View className="mb-6">
          <Text className="text-white/40 text-xs mb-2 uppercase tracking-widest">장소</Text>
          <TextInput
            value={venue}
            onChangeText={setVenue}
            placeholder="웨딩홀 이름"
            placeholderTextColor="#ffffff33"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base"
          />
        </View>

        {/* Attendance */}
        <View>
          <Text className="text-white/40 text-xs mb-2 uppercase tracking-widest">참석 여부</Text>
          <View className="flex-row gap-2">
            {ATTENDANCE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setAttendance(opt.value)}
                className={`flex-1 py-3 rounded-xl items-center border ${
                  attendance === opt.value
                    ? 'bg-pink-400 border-pink-400'
                    : 'bg-white/5 border-white/10'
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
    </KeyboardAvoidingView>
  );
}
