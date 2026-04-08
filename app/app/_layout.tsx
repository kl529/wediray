import '../global.css';
import { useEffect, useRef, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import Head from 'expo-router/head';
import { Stack, useRouter, useSegments } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useFonts, Gaegu_400Regular, Gaegu_700Bold } from '@expo-google-fonts/gaegu';
import { Fredoka_400Regular, Fredoka_600SemiBold } from '@expo-google-fonts/fredoka';
import PretendardVariable from '../assets/fonts/PretendardVariable.ttf';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;

  // On web, Fredoka/Gaegu are loaded via CSS in global.css (Vercel doesn't serve
  // files from /assets/node_modules/@expo-google-fonts paths)
  const [fontsLoaded, fontError] = useFonts(
    Platform.OS === 'web'
      ? { PretendardVariable }
      : { Fredoka_400Regular, Fredoka_600SemiBold, Gaegu_400Regular, Gaegu_700Bold, PretendardVariable }
  );

  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if ((fontsLoaded || fontError) && authReady) SplashScreen.hideAsync();
  }, [fontsLoaded, authReady]);

  useEffect(() => {
    const timeout = setTimeout(() => setAuthReady(true), 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      clearTimeout(timeout);
      const inAuthGroup = segmentsRef.current[0] === '(auth)';

      if (session && inAuthGroup) {
        router.replace('/(app)');
      } else if (!session && !inAuthGroup) {
        router.replace('/(auth)/login');
      }

      setAuthReady(true);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
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

  if (!fontsLoaded && !fontError) return null;

  return (
    <>
      <Head>
        <title>wediary — 결혼식 다이어리</title>
        <meta name="description" content="결혼식 청첩장을 관리하고, 축의금과 기억을 기록하는 나만의 웨딩 다이어리" />
        <meta property="og:title" content="wediary — 결혼식 다이어리" />
        <meta property="og:description" content="결혼식 청첩장을 관리하고, 축의금과 기억을 기록하는 나만의 웨딩 다이어리" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="wediary" />
        <meta property="og:url" content="https://wediary-lyvas-projects.vercel.app" />
        <meta property="og:image" content="https://wediary-lyvas-projects.vercel.app/favicon.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="wediary — 결혼식 다이어리" />
        <meta name="twitter:description" content="결혼식 청첩장을 관리하고, 축의금과 기억을 기록하는 나만의 웨딩 다이어리" />
        <meta name="twitter:image" content="https://wediary-lyvas-projects.vercel.app/favicon.png" />
        <meta name="theme-color" content="#FF1493" />
        <meta name="color-scheme" content="dark" />
        <meta name="application-name" content="wediary" />
        <meta name="apple-mobile-web-app-title" content="wediary" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </>
  );
}
