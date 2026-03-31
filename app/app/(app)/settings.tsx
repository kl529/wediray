import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

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
        <TouchableOpacity onPress={() => router.back()}>
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
          onPress={handleSignOut}
          className="bg-white/5 border border-white/10 rounded-2xl p-4"
        >
          <Text className="text-red-400 text-sm font-semibold">로그아웃</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
