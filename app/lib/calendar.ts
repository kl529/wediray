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
    const local = calendars.find((c) => c.accessLevel === 'owner');
    if (!local) throw new Error('쓰기 가능한 캘린더를 찾을 수 없습니다.');
    calendarId = local.id;
  }

  // All-day event (time not stored in our DB)
  const [y, m, d] = params.date.split('-').map(Number);
  const startDate = new Date(y, m - 1, d, 0, 0, 0);
  const endDate = new Date(y, m - 1, d, 23, 59, 59);

  await Calendar.createEventAsync(calendarId, {
    title: `${params.groom} ♥ ${params.bride} 결혼식`,
    startDate,
    endDate,
    allDay: true,
    location: params.venue,
    alarms: [{ relativeOffset: -1440 }], // 하루 전 알림
  });
}
