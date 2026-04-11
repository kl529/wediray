import { Platform } from 'react-native';

function downloadIcs(params: {
  groom: string;
  bride: string;
  date: string;
  venue: string;
  time?: string | null;
}): void {
  const { groom, bride, date, venue, time } = params;
  const [y, m, d] = date.split('-').map(Number);

  let dtStart: string;
  let dtEnd: string;

  if (time) {
    const [h, min] = time.split(':').map(Number);
    const pad = (n: number) => String(n).padStart(2, '0');
    dtStart = `${y}${pad(m)}${pad(d)}T${pad(h)}${pad(min)}00`;
    const endH = h + 2;
    dtEnd = `${y}${pad(m)}${pad(d)}T${pad(endH)}${pad(min)}00`;
  } else {
    const pad = (n: number) => String(n).padStart(2, '0');
    dtStart = `${y}${pad(m)}${pad(d)}`;
    dtEnd = `${y}${pad(m)}${pad(d)}`;
  }

  const allDay = !time;
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${groom} ♥ ${bride} 결혼식`,
    allDay ? `DTSTART;VALUE=DATE:${dtStart}` : `DTSTART:${dtStart}`,
    allDay ? `DTEND;VALUE=DATE:${dtEnd}` : `DTEND:${dtEnd}`,
    `LOCATION:${venue}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${groom}_${bride}_결혼식.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function addWeddingToCalendar(params: {
  groom: string;
  bride: string;
  date: string;   // YYYY-MM-DD
  venue: string;
  time?: string | null;  // HH:MM
}): Promise<void> {
  if (Platform.OS === 'web') {
    downloadIcs(params);
    return;
  }

  const Calendar = await import('expo-calendar');
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
  let startDate: Date;
  let endDate: Date;

  if (params.time) {
    const [h, min] = params.time.split(':').map(Number);
    startDate = new Date(y, m - 1, d, h, min, 0);
    endDate = new Date(y, m - 1, d, h + 2, min, 0); // 결혼식 2시간 기준
  } else {
    // allDay: true causes java.lang.String cannot be cast to java.lang.boolean on Android
    // Use 00:00–23:59 time range instead — both platforms display it as a full-day event
    startDate = new Date(y, m - 1, d, 0, 0, 0);
    endDate = new Date(y, m - 1, d, 23, 59, 59);
  }

  await Calendar.createEventAsync(calendarId, {
    title: `${params.groom} ♥ ${params.bride} 결혼식`,
    startDate,
    endDate,
    location: params.venue,
    alarms: [{ relativeOffset: -1440 }], // 하루 전 알림
  });
}
