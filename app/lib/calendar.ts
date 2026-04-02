import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

export async function addWeddingToCalendar(params: {
  groom: string;
  bride: string;
  date: string;   // YYYY-MM-DD
  venue: string;
}): Promise<void> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') throw new Error('캘린더 접근 권한이 필요합니다.');

  let calendarId: string;
  if (Platform.OS === 'ios') {
    const defaultCal = await Calendar.getDefaultCalendarAsync();
    calendarId = defaultCal.id;
  } else {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    // allowsModifications is the reliable cross-version check on Android
    const writable = calendars.filter((c) => c.allowsModifications);
    // prefer primary/Google account over exchange/work calendars
    const primary =
      writable.find((c) => c.isPrimary) ??
      writable.find((c) => c.source?.type === 'com.google') ??
      writable[0];
    if (primary) {
      calendarId = primary.id;
    } else {
      // 에뮬레이터나 Google 계정 없는 기기: 로컬 캘린더 생성 (Android only)
      calendarId = await Calendar.createCalendarAsync({
        title: 'Wediary',
        color: '#f472b6',
        entityType: Calendar.EntityTypes.EVENT,
        name: 'wediary',
        ownerAccount: 'personal',
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });
    }
  }

  const [y, m, d] = params.date.split('-').map(Number);
  const startDate = new Date(y, m - 1, d, 0, 0, 0);
  const endDate = new Date(y, m - 1, d, 23, 59, 59);

  // allDay: true causes java.lang.String cannot be cast to java.lang.boolean on Android
  // Use 00:00–23:59 time range instead — both platforms display it as a full-day event
  await Calendar.createEventAsync(calendarId, {
    title: `${params.groom} ♥ ${params.bride} 결혼식`,
    startDate,
    endDate,
    location: params.venue,
    alarms: [{ relativeOffset: -1440 }], // 하루 전 알림
  });
}
