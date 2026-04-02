import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getWeddings, formatDateKR, isUpcoming, type Wedding } from '../../lib/db';
import { BRAND_PINK, ATTENDANCE_LABEL, ATTENDANCE_TEXT_COLOR } from '../../lib/constants';

function WeddingCard({ wedding, onPress }: { wedding: Wedding; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-3 active:opacity-70"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-white text-lg font-bold">
          {wedding.groom} ♥ {wedding.bride}
        </Text>
        <Text className={`text-sm font-semibold ${ATTENDANCE_TEXT_COLOR[wedding.attendance]}`}>
          {ATTENDANCE_LABEL[wedding.attendance]}
        </Text>
      </View>
      <Text className="text-white/50 text-sm mt-2">{formatDateKR(wedding.date)}</Text>
      <Text className="text-white/30 text-xs mt-1">{wedding.venue}</Text>
    </TouchableOpacity>
  );
}

function EmptyState({ tab }: { tab: 'upcoming' | 'done' }) {
  return (
    <View className="items-center justify-center py-20 gap-2">
      <Text className="text-4xl">{tab === 'upcoming' ? '💌' : '📖'}</Text>
      <Text className="text-white/40 text-sm mt-2">
        {tab === 'upcoming' ? '예정된 결혼식이 없어요' : '아직 기록이 없어요'}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { data: weddings = [], isLoading } = useQuery({
    queryKey: ['weddings'],
    queryFn: getWeddings,
  });

  const upcoming = weddings.filter(isUpcoming);
  const done = weddings.filter((w) => !isUpcoming(w));

  const [tab, setTab] = useState<'upcoming' | 'done'>('upcoming');
  const list = tab === 'upcoming' ? upcoming : done;

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-16 pb-4">
        <Text className="text-pink-400 text-2xl font-bold tracking-widest">wediary</Text>
        <TouchableOpacity onPress={() => router.push('/(app)/settings')}>
          <Text className="text-white/40 text-sm">설정</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row mx-6 mb-4 bg-white/5 rounded-xl p-1">
        <TouchableOpacity
          onPress={() => setTab('upcoming')}
          className={`flex-1 py-2 rounded-lg items-center ${tab === 'upcoming' ? 'bg-pink-400' : ''}`}
        >
          <Text className={`text-sm font-semibold ${tab === 'upcoming' ? 'text-black' : 'text-white/40'}`}>
            예정 {upcoming.length > 0 ? `(${upcoming.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('done')}
          className={`flex-1 py-2 rounded-lg items-center ${tab === 'done' ? 'bg-pink-400' : ''}`}
        >
          <Text className={`text-sm font-semibold ${tab === 'done' ? 'text-black' : 'text-white/40'}`}>
            지난 결혼식 {done.length > 0 ? `(${done.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={BRAND_PINK} />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          ListEmptyComponent={<EmptyState tab={tab} />}
          renderItem={({ item }) => (
            <WeddingCard
              wedding={item}
              onPress={() => router.push(`/(app)/${item.id}`)}
            />
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/(app)/new')}
        className="absolute bottom-10 right-6 bg-pink-400 w-14 h-14 rounded-full items-center justify-center"
        style={{ boxShadow: `0 0 12px 4px rgba(244,114,182,0.5)`, elevation: 8 } as any}
      >
        <Text className="text-black text-3xl font-bold">+</Text>
      </TouchableOpacity>
    </View>
  );
}

