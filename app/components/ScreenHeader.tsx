import React from 'react';
import { View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}

export function ScreenHeader({ left, center, right }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row items-center justify-between px-6 pb-4"
      style={{ paddingTop: insets.top + (Platform.OS === 'web' ? 12 : 4) }}
    >
      <View>{left ?? null}</View>
      {center != null ? (
        <View className="flex-1 items-center">{center}</View>
      ) : null}
      <View>{right ?? null}</View>
    </View>
  );
}
