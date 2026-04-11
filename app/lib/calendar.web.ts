export async function addWeddingToCalendar(params: {
  groom: string;
  bride: string;
  date: string;   // YYYY-MM-DD
  venue: string;
  time?: string | null;  // HH:MM
}): Promise<void> {
  const { groom, bride, date, venue, time } = params;
  const [y, m, d] = date.split('-').map(Number);
  const pad = (n: number) => String(n).padStart(2, '0');

  let dtStart: string;
  let dtEnd: string;

  if (time) {
    const [h, min] = time.split(':').map(Number);
    dtStart = `${y}${pad(m)}${pad(d)}T${pad(h)}${pad(min)}00`;
    dtEnd = `${y}${pad(m)}${pad(d)}T${pad(h + 2)}${pad(min)}00`;
  } else {
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
