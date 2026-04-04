import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getWeddings, formatDateKR, formatTimeKR, isUpcoming, type Wedding } from '../../lib/db';
import { BRAND_PINK, ATTENDANCE_LABEL, ATTENDANCE_BORDER, ATTENDANCE_PILL_BG, ATTENDANCE_PILL_TEXT } from '../../lib/constants';
import { addWeddingToCalendar } from '../../lib/calendar';

function WeddingCard({ wedding, onPress }: { wedding: Wedding; onPress: () => void }) {
  const [calendarAdded, setCalendarAdded] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const wDate = new Date(wedding.date + 'T00:00:00');
  const daysUntil = Math.round((wDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const upcoming = daysUntil >= 0;
  const showDDay = upcoming;
  const dDayLabel = daysUntil === 0 ? 'D-Day' : `D-${daysUntil}`;
  const att = (ATTENDANCE_LABEL[wedding.attendance] ? wedding.attendance : 'pending') as typeof wedding.attendance;

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={`${wedding.groom} ♥ ${wedding.bride}, ${formatDateKR(wedding.date)}, ${ATTENDANCE_LABEL[att]}`}
      className={`bg-white/10 border rounded-2xl p-4 mb-3 active:opacity-70 ${ATTENDANCE_BORDER[att]}`}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-white text-lg font-gaegu-bold">
            {wedding.groom} ♥ {wedding.bride}
          </Text>
          <View className="flex-row items-center gap-2 mt-1 flex-wrap">
            <Text className="text-white/80 text-sm">{formatDateKR(wedding.date)}</Text>
            {wedding.time ? <Text className="text-white/80 text-sm">{formatTimeKR(wedding.time)}</Text> : null}
            {showDDay && <Text className="text-pink-400 text-xs font-semibold">{dDayLabel}</Text>}
          </View>
          {wedding.venue ? <Text className="text-white/40 text-xs mt-0.5">{wedding.venue}</Text> : null}
        </View>
        <View className="items-end gap-2">
          <View className={`px-2 py-0.5 rounded-full ${ATTENDANCE_PILL_BG[att]}`}>
            <Text className={`text-xs font-bold ${ATTENDANCE_PILL_TEXT[att]}`}>{ATTENDANCE_LABEL[att]}</Text>
          </View>
          {upcoming && (
            <TouchableOpacity
              onPress={async () => {
                try {
                  await addWeddingToCalendar({
                    groom: wedding.groom,
                    bride: wedding.bride,
                    date: wedding.date,
                    venue: wedding.venue,
                    time: wedding.time,
                  });
                  setCalendarAdded(true);
                  setTimeout(() => setCalendarAdded(false), 3000);
                } catch (e: any) {
                  Alert.alert('추가 실패', e.message);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel="캘린더에 추가"
              className={`p-1.5 rounded-lg ${calendarAdded ? 'bg-lime-400/20' : 'bg-white/10'}`}
            >
              <Ionicons
                name={calendarAdded ? 'checkmark' : 'calendar-outline'}
                size={15}
                color={calendarAdded ? '#a3e635' : 'rgba(255,255,255,0.5)'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
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
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-16 pb-4">
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
          <Text className="text-4xl mb-3">😢</Text>
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
        style={{ bottom: insets.bottom + 16, boxShadow: `0 0 12px 4px rgba(244,114,182,0.5)`, elevation: 8 } as any}
      >
        <Text className="text-black text-3xl font-bold">+</Text>
      </TouchableOpacity>
    </View>
  );
}

