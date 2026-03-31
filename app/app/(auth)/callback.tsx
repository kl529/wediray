import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const checkAndRedirect = async () => {
      // Give Supabase a moment to process the OAuth callback URL
      await new Promise(resolve => setTimeout(resolve, 500));
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/(app)');
      } else {
        router.replace('/(auth)/login');
      }
    };
    checkAndRedirect();
  }, []);

  return (
    <View className="flex-1 bg-black items-center justify-center">
      <ActivityIndicator color="#FF69B4" size="large" />
    </View>
  );
}
