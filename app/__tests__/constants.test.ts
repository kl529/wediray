// 디자인 시스템 무결성 테스트
// constants.ts가 모든 attendance 상태를 커버하는지 검증.

import {
  BRAND_PINK,
  KAKAO_YELLOW,
  ATTENDANCE_LABEL,
  ATTENDANCE_PILL_ACTIVE,
  ATTENDANCE_PILL_ACTIVE_TEXT,
} from '../lib/constants';
import type { Attendance } from '../lib/db';

const ALL_STATES: Attendance[] = ['attending', 'absent', 'pending'];

// ── 브랜드 색상 ────────────────────────────────────────────────

describe('브랜드 색상', () => {
  it('BRAND_PINK는 DESIGN.md accent (#FF1493)', () => {
    expect(BRAND_PINK).toBe('#FF1493');
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

// ── ATTENDANCE_PILL_ACTIVE (상세 화면 pill border+bg) ─────────

describe('ATTENDANCE_PILL_ACTIVE', () => {
  it('모든 상태에 pill 스타일 존재', () => {
    ALL_STATES.forEach((s) => {
      expect(ATTENDANCE_PILL_ACTIVE[s]).toBeTruthy();
    });
  });

  it('attending은 lime 계열', () => {
    expect(ATTENDANCE_PILL_ACTIVE.attending).toMatch(/lime/);
  });

  it('absent는 pink 계열', () => {
    expect(ATTENDANCE_PILL_ACTIVE.absent).toMatch(/pink/);
  });

  it('pending은 white 계열 (neutral — FINDING-004)', () => {
    expect(ATTENDANCE_PILL_ACTIVE.pending).toMatch(/white/);
  });
});

// ── ATTENDANCE_PILL_ACTIVE_TEXT (상세 화면 pill 텍스트) ───────

describe('ATTENDANCE_PILL_ACTIVE_TEXT', () => {
  it('모든 상태에 텍스트 색상 존재', () => {
    ALL_STATES.forEach((s) => {
      expect(ATTENDANCE_PILL_ACTIVE_TEXT[s]).toBeTruthy();
    });
  });

  it('모두 "text-" 접두사로 시작하는 Tailwind 클래스', () => {
    ALL_STATES.forEach((s) => {
      expect(ATTENDANCE_PILL_ACTIVE_TEXT[s]).toMatch(/^text-/);
    });
  });

  it('attending은 lime 계열 텍스트', () => {
    expect(ATTENDANCE_PILL_ACTIVE_TEXT.attending).toMatch(/lime/);
  });

  it('absent는 pink 계열 텍스트', () => {
    expect(ATTENDANCE_PILL_ACTIVE_TEXT.absent).toMatch(/pink/);
  });

  it('pending은 white 계열 텍스트', () => {
    expect(ATTENDANCE_PILL_ACTIVE_TEXT.pending).toMatch(/white/);
  });
});
