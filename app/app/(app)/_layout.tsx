import { Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const webWrapper = Platform.OS === 'web'
  ? { maxWidth: 430, width: '100%', alignSelf: 'center' as const, flex: 1 }
  : { flex: 1 };

export default function AppLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <View style={webWrapper}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="[id]" />
        <Stack.Screen name="settings" />
      </Stack>
      </View>
    </QueryClientProvider>
  );
}
