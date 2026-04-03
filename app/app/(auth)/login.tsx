import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { KAKAO_YELLOW } from '../../lib/constants';
import * as WebBrowser from 'expo-web-browser';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleKakaoLogin() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: 'wediary://callback',
        skipBrowserRedirect: true,
        scopes: 'profile_nickname account_email',
      },
    });
    if (error) { console.error(error); setLoading(false); return; }
    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(data.url, 'wediary://callback');
      if (result.type === 'success' && result.url) {
        await supabase.auth.exchangeCodeForSession(result.url);
      }
    }
    setLoading(false);
  }

  return (
    <View className="flex-1 bg-black items-center justify-center gap-8">
      <View className="items-center gap-2">
        <Text className="text-pink-400 text-5xl font-fredoka-semibold tracking-widest">wediary</Text>
        <Text className="text-white/60 text-sm">결혼식 기억을 모아두는 다이어리</Text>
      </View>

      <TouchableOpacity
        onPress={handleKakaoLogin}
        disabled={loading}
        style={{ backgroundColor: KAKAO_YELLOW }}
        className="rounded-xl px-8 py-4 flex-row items-center gap-3 w-72 justify-center"
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text className="text-black font-semibold text-base">카카오로 시작하기</Text>
        )}
      </TouchableOpacity>

      {__DEV__ && (
        <TouchableOpacity
          onPress={() => router.replace('/(app)')}
          className="mt-4"
        >
          <Text className="text-white/30 text-xs">로그인 없이 계속 (테스트)</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
