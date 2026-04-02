import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { addWeddingToCalendar } from '../../lib/calendar';

export default function SettingsScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? user?.user_metadata?.email ?? '');
    });
  }, []);

  function handleSignOut() {
    Alert.alert('로그아웃', '정말 로그아웃할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: () => supabase.auth.signOut(),
      },
    ]);
  }

  return (
    <View className="flex-1 bg-black">
      <View className="px-6 pt-16 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          className="py-2"
        >
          <Text className="text-white/50 text-base">← 뒤로</Text>
        </TouchableOpacity>
      </View>

      <View className="px-6 pt-4">
        <Text className="text-pink-400 text-2xl font-bold tracking-widest mb-8">설정</Text>

        <View className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
          <Text className="text-white/40 text-xs uppercase tracking-widest mb-1">계정</Text>
          <Text className="text-white text-sm">{email || '—'}</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/privacy')}
          accessibilityRole="button"
          accessibilityLabel="개인정보처리방침"
          className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4"
        >
          <Text className="text-white/60 text-sm">개인정보처리방침</Text>
        </TouchableOpacity>

        {/* DEV ONLY — 캘린더 연동 테스트 */}
        {__DEV__ && (
          <TouchableOpacity
            onPress={async () => {
              try {
                await addWeddingToCalendar({
                  groom: '김철수',
                  bride: '이영희',
                  date: '2026-06-15',
                  venue: '더플라자 호텔 그랜드볼룸',
                });
                Alert.alert('✅ 성공', '캘린더에 추가됐습니다. 기기 캘린더 앱을 확인하세요.');
              } catch (e: any) {
                Alert.alert('❌ 실패', e.message);
              }
            }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4"
          >
            <Text className="text-sky-400 text-sm font-semibold">📅 캘린더 연동 테스트 (DEV)</Text>
            <Text className="text-white/30 text-xs mt-1">김철수 ♥ 이영희 · 2026-06-15</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleSignOut}
          accessibilityRole="button"
          accessibilityLabel="로그아웃"
          className="bg-white/5 border border-white/10 rounded-2xl p-4"
        >
          <Text className="text-red-400 text-sm font-semibold">로그아웃</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
