import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  async function handleKakaoLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: 'wediary://auth/callback',
      },
    });
    if (error) console.error(error);
    setLoading(false);
  }

  return (
    <View className="flex-1 bg-black items-center justify-center gap-8">
      <View className="items-center gap-2">
        <Text className="text-pink-400 text-5xl font-bold tracking-widest">wediary</Text>
        <Text className="text-white/60 text-sm">결혼식 기억을 모아두는 다이어리</Text>
      </View>

      <TouchableOpacity
        onPress={handleKakaoLogin}
        disabled={loading}
        className="bg-[#FEE500] rounded-xl px-8 py-4 flex-row items-center gap-3 w-72 justify-center"
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text className="text-black font-semibold text-base">카카오로 시작하기</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
