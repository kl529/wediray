export async function addWeddingToCalendar(params: {
  groom: string;
  bride: string;
  date: string;   // YYYY-MM-DD
  venue: string;
  time?: string | null;  // HH:MM
}): Promise<void> {
  const [y, m, d] = params.date.split('-').map(Number);

  let dtStart: string;
  let dtEnd: string;

  const pad = (n: number) => String(n).padStart(2, '0');
  if (params.time) {
    const [h, min] = params.time.split(':').map(Number);
    // Use Date for end time to handle midnight overflow (e.g. 22:00 + 2h = next day 00:00)
    const start = new Date(y, m - 1, d, h, min, 0);
    const end   = new Date(y, m - 1, d, h + 2, min, 0);
    const fmt = (dt: Date) =>
      `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`;
    dtStart = fmt(start);
    dtEnd   = fmt(end);
  } else {
    dtStart = `${y}${pad(m)}${pad(d)}`;
    // RFC 5545: all-day DTEND is exclusive — must be the day after
    const next = new Date(y, m - 1, d + 1);
    dtEnd = `${next.getFullYear()}${pad(next.getMonth() + 1)}${pad(next.getDate())}`;
  }

  const allDay = !params.time;
  const dtLine = allDay
    ? `DTSTART;VALUE=DATE:${dtStart}\r\nDTEND;VALUE=DATE:${dtEnd}`
    : `DTSTART:${dtStart}\r\nDTEND:${dtEnd}`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//wediary//KR',
    'BEGIN:VEVENT',
    `SUMMARY:${params.groom} ♥ ${params.bride} 결혼식`,
    dtLine,
    `LOCATION:${params.venue}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT1440M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${params.groom} ♥ ${params.bride} 결혼식 하루 전입니다`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const file = new File([blob], 'wedding.ics', { type: 'text/calendar' });

  // iOS Safari: Web Share API로 .ics 공유 → 캘린더 앱이 직접 열림
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: `${params.groom} ♥ ${params.bride} 결혼식` });
    return;
  }

  // fallback: 파일 다운로드
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wedding.ics';
  a.click();
  URL.revokeObjectURL(url);
}
