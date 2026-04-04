import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ConfirmModal } from '../../components/ConfirmModal';
import { supabase } from '../../lib/supabase';

export default function SettingsScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setName(
        user?.user_metadata?.name
        ?? user?.user_metadata?.full_name
        ?? user?.user_metadata?.preferred_username
        ?? '',
      );
      setEmail(user?.email ?? user?.user_metadata?.email ?? '');
    });
  }, []);

  return (
    <View className="flex-1 bg-black">
      <ScreenHeader
        left={
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            className="py-2"
          >
            <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        }
      />

      <View className="px-6 pt-4">
        <Text className="text-pink-400 text-2xl font-fredoka-semibold mb-8">설정</Text>

        <View className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
          <Text className="text-white/40 text-xs mb-1">계정</Text>
          {name ? (
            <>
              <Text className="text-white text-sm font-semibold">{name}</Text>
              {email ? <Text className="text-white/40 text-xs mt-0.5">{email}</Text> : null}
            </>
          ) : (
            <Text className="text-white text-sm">{email || '—'}</Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => router.push('/privacy')}
          accessibilityRole="button"
          accessibilityLabel="개인정보처리방침"
          className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 flex-row items-center justify-between"
        >
          <Text className="text-white/60 text-sm">개인정보처리방침</Text>
          <Text className="text-white/30 text-base">›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowLogout(true)}
          accessibilityRole="button"
          accessibilityLabel="로그아웃"
          className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4"
        >
          <Text className="text-red-400 text-sm font-semibold">로그아웃</Text>
        </TouchableOpacity>

        {Constants.expoConfig?.version ? (
          <Text className="text-white/20 text-xs text-center">v{Constants.expoConfig.version}</Text>
        ) : null}
      </View>

      <ConfirmModal
        visible={showLogout}
        title="로그아웃"
        message="정말 로그아웃할까요?"
        confirmLabel="로그아웃"
        onConfirm={async () => {
          setShowLogout(false);
          const { error } = await supabase.auth.signOut();
          if (error) Alert.alert('로그아웃 실패', error.message);
        }}
        onCancel={() => setShowLogout(false)}
        destructive
      />
    </View>
  );
}
