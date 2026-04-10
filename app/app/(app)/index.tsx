import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getWeddings, formatDateKR, formatTimeKR, isUpcoming, type Wedding } from '../../lib/db';
import { BRAND_PINK, ATTENDANCE_LABEL } from '../../lib/constants';

const STRIP_COLOR: Record<string, string> = {
  attending: '#CCFF00',
  absent: '#FF1493',
  pending: '#2A2A2A',
};

function WeddingCard({ wedding, onPress }: { wedding: Wedding; onPress: () => void }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const wDate = new Date(wedding.date + 'T00:00:00');
  const daysUntil = Math.round((wDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const att = (ATTENDANCE_LABEL[wedding.attendance] ? wedding.attendance : 'pending') as typeof wedding.attendance;

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={`${wedding.groom} ♥ ${wedding.bride}, ${formatDateKR(wedding.date)}, ${ATTENDANCE_LABEL[att]}`}
      className="bg-[#141414] border border-[#2A2A2A] rounded-2xl mb-3 overflow-hidden active:opacity-70"
    >
      {/* Left accent strip */}
      <View
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ backgroundColor: STRIP_COLOR[att] ?? '#2A2A2A' }}
      />

      <View className="p-4 pl-[18px]">
        {/* Couple names */}
        <Text className="text-white text-lg font-gaegu-bold mb-2">
          {wedding.groom} <Text className="text-pink-400">♥</Text> {wedding.bride}
        </Text>

        {/* Date + time row */}
        <View className="flex-row items-center gap-2 mb-1.5">
          <Ionicons name="calendar-outline" size={12} color="#FF1493" />
          <Text className="text-pink-400 text-xs font-semibold">{formatDateKR(wedding.date)}</Text>
          {wedding.time ? (
            <Text className="text-white/40 text-xs">{formatTimeKR(wedding.time)}</Text>
          ) : null}
        </View>

        {/* Venue row */}
        {wedding.venue ? (
          <View className="flex-row items-center gap-2">
            <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.3)" />
            <Text className="text-[#7EB8FF] text-xs font-medium" numberOfLines={1}>
              {wedding.venue}
            </Text>
          </View>
        ) : null}

        {/* D-day / past row */}
        <View className="border-t border-[#2A2A2A] mt-3 pt-2.5 flex-row items-center">
          {daysUntil >= 0 ? (
            <View
              className="bg-pink-400 rounded-full px-3 py-1 flex-row items-center gap-1.5"
              style={{ shadowColor: '#FF1493', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6 } as any}
            >
              <Ionicons name="calendar" size={10} color="#fff" />
              <Text className="text-white text-xs font-extrabold tracking-tight">
                {daysUntil === 0 ? 'D-Day' : `D-${daysUntil}`}
              </Text>
            </View>
          ) : (
            <Text className="text-white/20 text-xs">{Math.abs(daysUntil)}일 전</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ tab }: { tab: 'upcoming' | 'done' }) {
  return (
    <View className="items-center justify-center py-20 gap-2">
      <Ionicons
        name={tab === 'upcoming' ? 'mail-outline' : 'archive-outline'}
        size={40}
        color="rgba(255,255,255,0.2)"
      />
      <Text className="text-white/40 text-sm mt-2">
        {tab === 'upcoming' ? '예정된 결혼식이 없어요' : '아직 기록이 없어요'}
      </Text>
      <Text className="text-white/20 text-xs mt-1">
        {tab === 'upcoming'
          ? '오른쪽 아래 + 버튼으로 추가해보세요'
          : '지난 결혼식을 추가하면 여기에 나타나요'}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: weddings = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['weddings'],
    queryFn: getWeddings,
  });

  const upcoming = weddings.filter(isUpcoming);
  const done = weddings.filter((w) => !isUpcoming(w)).sort((a, b) => b.date.localeCompare(a.date));

  const [tab, setTab] = useState<'upcoming' | 'done'>('upcoming');
  const list = tab === 'upcoming' ? upcoming : done;

  return (
    <>
    <Head>
      <title>wediary — 결혼식 다이어리</title>
      <meta name="robots" content="noindex, nofollow" />
    </Head>
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pb-4" style={{ paddingTop: insets.top + (Platform.OS === 'web' ? 12 : 4) }}>
        <Text className="text-pink-400 text-2xl font-fredoka-semibold tracking-widest">wediary</Text>
        <TouchableOpacity
          onPress={() => router.push('/(app)/settings')}
          accessibilityRole="button"
          accessibilityLabel="설정"
          className="p-1"
        >
          <Ionicons name="settings-outline" size={22} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row mx-6 mb-4 bg-white/5 rounded-xl p-1">
        <TouchableOpacity
          onPress={() => setTab('upcoming')}
          accessibilityRole="tab"
          accessibilityLabel={`예정${upcoming.length > 0 ? ` (${upcoming.length})` : ''}`}
          accessibilityState={{ selected: tab === 'upcoming' }}
          className={`flex-1 py-2 rounded-lg items-center ${tab === 'upcoming' ? 'bg-pink-400' : ''}`}
        >
          <Text className={`text-sm font-semibold ${tab === 'upcoming' ? 'text-black' : 'text-white/40'}`}>
            예정 {upcoming.length > 0 ? `(${upcoming.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('done')}
          accessibilityRole="tab"
          accessibilityLabel={`지난 결혼식${done.length > 0 ? ` (${done.length})` : ''}`}
          accessibilityState={{ selected: tab === 'done' }}
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
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cloud-offline-outline" size={40} color="rgba(255,255,255,0.25)" style={{ marginBottom: 12 }} />
          <Text className="text-white/50 text-sm text-center">목록을 불러오지 못했어요.{'\n'}잠시 후 다시 시도해주세요.</Text>
          <TouchableOpacity onPress={() => refetch()} className="mt-5 px-5 py-2.5 bg-white/10 rounded-xl">
            <Text className="text-white/60 text-sm">다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 88 }}
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
        accessibilityRole="button"
        accessibilityLabel="결혼식 추가"
        className="absolute right-6 bg-pink-400 w-14 h-14 rounded-full items-center justify-center"
        style={{ bottom: insets.bottom + 16, shadowColor: '#FF1493', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 } as any}
      >
        <Text className="text-black text-3xl font-bold">+</Text>
      </TouchableOpacity>
    </View>
    </>
  );
}
