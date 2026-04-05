import type { Attendance } from './db';

// Brand color — single source of truth for Tailwind pink-400 (#FF1493 = DESIGN.md accent)
export const BRAND_PINK = '#FF1493';

// Kakao brand color — mandated by Kakao design guidelines
export const KAKAO_YELLOW = '#FEE500';

// Attendance labels
export const ATTENDANCE_LABEL: Record<Attendance, string> = {
  attending: '참석',
  absent: '불참',
  pending: '미정',
};

// Pill active style (border + bg) — detail screen attendance selector
export const ATTENDANCE_PILL_ACTIVE: Record<Attendance, string> = {
  attending: 'bg-lime-400/15 border-lime-400',
  absent: 'bg-pink-400/15 border-pink-400',
  pending: 'bg-white/15 border-white/30',
};

// Pill active text color — detail screen attendance selector
export const ATTENDANCE_PILL_ACTIVE_TEXT: Record<Attendance, string> = {
  attending: 'text-lime-400',
  absent: 'text-pink-400',
  pending: 'text-white/70',
};
