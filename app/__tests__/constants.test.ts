// 디자인 시스템 무결성 테스트
// constants.ts가 모든 attendance 상태를 커버하는지, 접근성 규칙을 지키는지 검증.

import {
  BRAND_PINK,
  KAKAO_YELLOW,
  ATTENDANCE_LABEL,
  ATTENDANCE_TEXT_COLOR,
  ATTENDANCE_PILL_BG,
  ATTENDANCE_PILL_TEXT,
} from '../lib/constants';
import type { Attendance } from '../lib/db';

const ALL_STATES: Attendance[] = ['attending', 'absent', 'pending'];

// ── 브랜드 색상 ────────────────────────────────────────────────

describe('브랜드 색상', () => {
  it('BRAND_PINK는 Tailwind pink-400 (#f472b6)', () => {
    expect(BRAND_PINK).toBe('#f472b6');
  });

  it('KAKAO_YELLOW는 카카오 공식 색상 (#FEE500)', () => {
    expect(KAKAO_YELLOW).toBe('#FEE500');
  });
});

// ── ATTENDANCE_LABEL ───────────────────────────────────────────

describe('ATTENDANCE_LABEL', () => {
  it('모든 상태에 레이블 존재', () => {
    ALL_STATES.forEach((s) => {
      expect(ATTENDANCE_LABEL[s]).toBeTruthy();
    });
  });

  it('레이블은 올바른 한국어', () => {
    expect(ATTENDANCE_LABEL.attending).toBe('참석');
    expect(ATTENDANCE_LABEL.absent).toBe('불참');
    expect(ATTENDANCE_LABEL.pending).toBe('미정');
  });

  it('레이블에 공백 없음 (UI 레이아웃 보호)', () => {
    ALL_STATES.forEach((s) => {
      expect(ATTENDANCE_LABEL[s].trim()).toBe(ATTENDANCE_LABEL[s]);
    });
  });
});

// ── ATTENDANCE_TEXT_COLOR (홈 카드용 인라인 텍스트) ──────────────

describe('ATTENDANCE_TEXT_COLOR', () => {
  it('모든 상태에 텍스트 색상 존재', () => {
    ALL_STATES.forEach((s) => {
      expect(ATTENDANCE_TEXT_COLOR[s]).toBeTruthy();
    });
  });

  it('모두 "text-" 접두사로 시작하는 Tailwind 클래스', () => {
    ALL_STATES.forEach((s) => {
      expect(ATTENDANCE_TEXT_COLOR[s]).toMatch(/^text-/);
    });
  });

  it('attending은 선명한 lime-400 (어두운 배경 위 가시성)', () => {
    expect(ATTENDANCE_TEXT_COLOR.attending).toBe('text-lime-400');
  });

  it('pending은 선명한 sky-400', () => {
    expect(ATTENDANCE_TEXT_COLOR.pending).toBe('text-sky-400');
  });

  it('absent는 반투명 흰색 (출석하지 않음을 표현)', () => {
    expect(ATTENDANCE_TEXT_COLOR.absent).toMatch(/text-white/);
  });
});

// ── ATTENDANCE_PILL_BG (상세 화면 배지 배경) ──────────────────

describe('ATTENDANCE_PILL_BG', () => {
  it('모든 상태에 배지 배경 존재', () => {
    ALL_STATES.forEach((s) => {
      expect(ATTENDANCE_PILL_BG[s]).toBeTruthy();
    });
  });

  it('모두 "bg-" 접두사로 시작하는 Tailwind 클래스', () => {
    ALL_STATES.forEach((s) => {
      expect(ATTENDANCE_PILL_BG[s]).toMatch(/^bg-/);
    });
  });

  it('attending은 밝은 배경 (lime-400)', () => {
    expect(ATTENDANCE_PILL_BG.attending).toBe('bg-lime-400');
  });

  it('pending은 밝은 배경 (sky-400)', () => {
    expect(ATTENDANCE_PILL_BG.pending).toBe('bg-sky-400');
  });

  it('absent는 어두운 배경 (반투명 흰색)', () => {
    expect(ATTENDANCE_PILL_BG.absent).toMatch(/bg-white\//);
  });
});

// ── ATTENDANCE_PILL_TEXT (상세 화면 배지 텍스트) — 접근성 핵심 ──

describe('ATTENDANCE_PILL_TEXT — 접근성 (H-01)', () => {
  it('모든 상태에 배지 텍스트 색상 존재', () => {
    ALL_STATES.forEach((s) => {
      expect(ATTENDANCE_PILL_TEXT[s]).toBeTruthy();
    });
  });

  it('모두 "text-" 접두사로 시작하는 Tailwind 클래스', () => {
    ALL_STATES.forEach((s) => {
      expect(ATTENDANCE_PILL_TEXT[s]).toMatch(/^text-/);
    });
  });

  it('[H-01] absent 배지 텍스트는 text-black이 아님 (어두운 bg → 낮은 대비)', () => {
    // absent pill: bg-white/10 (어두운 배경). text-black이면 대비율 ~1.1:1 → WCAG 실패.
    expect(ATTENDANCE_PILL_TEXT.absent).not.toBe('text-black');
  });

  it('[H-01] absent 배지 텍스트는 흰색 계열 (어두운 배경 위 가독성)', () => {
    expect(ATTENDANCE_PILL_TEXT.absent).toMatch(/text-white/);
  });

  it('attending 배지 텍스트는 text-black (lime-400 밝은 bg 위)', () => {
    expect(ATTENDANCE_PILL_TEXT.attending).toBe('text-black');
  });

  it('pending 배지 텍스트는 text-black (sky-400 밝은 bg 위)', () => {
    expect(ATTENDANCE_PILL_TEXT.pending).toBe('text-black');
  });
});

// ── 일관성: PILL_BG와 PILL_TEXT 배경/텍스트 쌍이 논리적으로 일관 ──

describe('PILL_BG / PILL_TEXT 쌍 일관성', () => {
  it('밝은 배경(attending/pending)에는 어두운 텍스트', () => {
    const lightBgStates: Attendance[] = ['attending', 'pending'];
    lightBgStates.forEach((s) => {
      // 밝은 bg (lime, sky) → text-black
      expect(ATTENDANCE_PILL_TEXT[s]).toBe('text-black');
    });
  });

  it('어두운 배경(absent)에는 밝은 텍스트', () => {
    // bg-white/10 (다크 테마에서 어두운 bg) → text-white 계열
    expect(ATTENDANCE_PILL_TEXT.absent).toMatch(/text-white/);
  });
});
