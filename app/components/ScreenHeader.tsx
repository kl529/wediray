import React from 'react';
import { View } from 'react-native';

interface Props {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}

export function ScreenHeader({ left, center, right }: Props) {
  return (
    <View className="flex-row items-center justify-between px-6 pt-16 pb-4">
      <View>{left ?? null}</View>
      {center != null ? (
        <View className="flex-1 items-center">{center}</View>
      ) : null}
      <View>{right ?? null}</View>
    </View>
  );
}
