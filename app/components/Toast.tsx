import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from '../lib/toast';

export function ToastHost() {
  const [message, setMessage] = useState('');
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    toast.setListener((msg) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMessage(msg);
      opacity.stopAnimation();
      opacity.setValue(0);
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      timerRef.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
          setMessage('');
        });
      }, 2200);
    });
    return () => {
      toast.setListener(null);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        opacity,
        position: 'absolute',
        bottom: insets.bottom + 24,
        left: 24,
        right: 24,
        alignItems: 'center',
        zIndex: 999,
      }}
    >
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.93)',
          borderRadius: 100,
          paddingHorizontal: 20,
          paddingVertical: 11,
        }}
      >
        <Text style={{ color: '#000', fontSize: 14, fontWeight: '600' }}>{message}</Text>
      </View>
    </Animated.View>
  );
}
