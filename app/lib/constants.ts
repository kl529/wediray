import type { Attendance } from './db';

// Brand color — single source of truth for Tailwind pink-400
export const BRAND_PINK = '#f472b6';

// Kakao brand color — mandated by Kakao design guidelines
export const KAKAO_YELLOW = '#FEE500';

// Attendance labels
export const ATTENDANCE_LABEL: Record<Attendance, string> = {
  attending: '참석',
  absent: '불참',
  pending: '미정',
};

// Inline text color (used in list cards)
export const ATTENDANCE_TEXT_COLOR: Record<Attendance, string> = {
  attending: 'text-lime-400',
  absent: 'text-white/40',
  pending: 'text-sky-400',
};

// Pill background color (used in detail screen badge)
export const ATTENDANCE_PILL_BG: Record<Attendance, string> = {
  attending: 'bg-lime-400',
  absent: 'bg-white/10',
  pending: 'bg-sky-400',
};

// Pill text color (attending/pending use text-black on light bg; absent uses white on dark bg)
export const ATTENDANCE_PILL_TEXT: Record<Attendance, string> = {
  attending: 'text-black',
  absent: 'text-white/50',
  pending: 'text-black',
};

// Card border color (used in list cards to indicate attendance)
export const ATTENDANCE_BORDER: Record<Attendance, string> = {
  attending: 'border-lime-400/60',
  absent: 'border-red-500/40',
  pending: 'border-white/15',
};
