import '../global.css';
import { useEffect, useRef } from 'react';
import { Alert, Linking } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useFonts, Gaegu_400Regular, Gaegu_700Bold } from '@expo-google-fonts/gaegu';
import { Fredoka_400Regular, Fredoka_600SemiBold } from '@expo-google-fonts/fredoka';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;

  const [fontsLoaded] = useFonts({
    Fredoka_400Regular,
    Fredoka_600SemiBold,
    Gaegu_400Regular,
    Gaegu_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const inAuthGroup = segmentsRef.current[0] === '(auth)';

      if (session && inAuthGroup) {
        router.replace('/(app)');
      } else if (!session && !inAuthGroup) {
        router.replace('/(auth)/login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Android: handle OAuth deep link callback
  useEffect(() => {
    const handleUrl = async ({ url }: { url: string }) => {
      if (!url.startsWith('wediary://callback')) return;
      const fragment = url.split('#')[1];
      if (fragment) {
        const params = Object.fromEntries(new URLSearchParams(fragment));
        if (params.access_token && params.refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });
          if (error) Alert.alert('로그인 실패', error.message);
          return;
        }
      }
      // PKCE fallback
      const { error } = await supabase.auth.exchangeCodeForSession(url);
      if (error) Alert.alert('로그인 실패', error.message);
    };
    Linking.getInitialURL().then((url) => { if (url) handleUrl({ url }); });
    const sub = Linking.addEventListener('url', handleUrl);
    return () => sub.remove();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}
