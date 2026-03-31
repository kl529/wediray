import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    // Supabase handles session from URL params automatically via onAuthStateChange
    // This screen just shows a loader while the session is being established
    const timer = setTimeout(() => {
      router.replace('/(app)');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-black items-center justify-center">
      <ActivityIndicator color="#FF69B4" size="large" />
    </View>
  );
}
