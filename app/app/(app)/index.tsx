import { View, Text, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-black items-center justify-center gap-6">
      <Text className="text-pink-400 text-3xl font-bold">결혼식 다이어리</Text>
      <Text className="text-white/60 text-sm">아직 기록이 없어요</Text>

      <TouchableOpacity
        onPress={() => supabase.auth.signOut()}
        className="mt-8 border border-white/20 rounded-xl px-6 py-3"
      >
        <Text className="text-white/40 text-sm">로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}
