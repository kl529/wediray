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

  if (params.time) {
    const [h, min] = params.time.split(':').map(Number);
    const pad = (n: number) => String(n).padStart(2, '0');
    dtStart = `${y}${pad(m)}${pad(d)}T${pad(h)}${pad(min)}00`;
    dtEnd   = `${y}${pad(m)}${pad(d)}T${pad(h + 2)}${pad(min)}00`;
  } else {
    const pad = (n: number) => String(n).padStart(2, '0');
    dtStart = `${y}${pad(m)}${pad(d)}`;
    dtEnd   = `${y}${pad(m)}${pad(d)}`;
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
