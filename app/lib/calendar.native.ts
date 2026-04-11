import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

export async function addWeddingToCalendar(params: {
  groom: string;
  bride: string;
  date: string;   // YYYY-MM-DD
  venue: string;
  time?: string | null;  // HH:MM
}): Promise<void> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') throw new Error('캘린더 접근 권한이 필요합니다.');

  let calendarId: string;
  if (Platform.OS === 'ios') {
    const defaultCal = await Calendar.getDefaultCalendarAsync();
    calendarId = defaultCal.id;
  } else {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const writable = calendars.filter((c) => c.allowsModifications);
    const primary =
      writable.find((c) => c.isPrimary) ??
      writable.find((c) => c.source?.type === 'com.google') ??
      writable[0];
    if (primary) {
      calendarId = primary.id;
    } else {
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
  let startDate: Date;
  let endDate: Date;

  if (params.time) {
    const [h, min] = params.time.split(':').map(Number);
    startDate = new Date(y, m - 1, d, h, min, 0);
    endDate = new Date(y, m - 1, d, h + 2, min, 0);
  } else {
    startDate = new Date(y, m - 1, d, 0, 0, 0);
    endDate = new Date(y, m - 1, d, 23, 59, 59);
  }

  await Calendar.createEventAsync(calendarId, {
    title: `${params.groom} ♥ ${params.bride} 결혼식`,
    startDate,
    endDate,
    location: params.venue,
    alarms: [{ relativeOffset: -1440 }],
  });
}
