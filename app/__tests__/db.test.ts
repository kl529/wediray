// Supabase uses AsyncStorage (native module) — mock it so pure helpers are testable
jest.mock('../lib/supabase', () => ({ supabase: {} }));

import { formatDateKR, isUpcoming } from '../lib/db';
import type { Wedding } from '../lib/db';

// ── formatDateKR ─────────────────────────────────────────────

describe('formatDateKR', () => {
  it('formats a date string to Korean', () => {
    expect(formatDateKR('2026-03-31')).toBe('2026년 3월 31일');
  });

  it('strips leading zeros from month and day', () => {
    expect(formatDateKR('2026-01-05')).toBe('2026년 1월 5일');
  });

  it('handles December correctly', () => {
    expect(formatDateKR('2025-12-25')).toBe('2025년 12월 25일');
  });
});

// ── isUpcoming ───────────────────────────────────────────────

function makeWedding(date: string): Wedding {
  return {
    id: 'test-id',
    user_id: 'user-id',
    groom: '철수',
    bride: '영희',
    date,
    venue: '그랜드볼룸',
    attendance: 'attending',
    created_at: '2026-01-01T00:00:00Z',
  };
}

describe('isUpcoming', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-31T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns true for today', () => {
    expect(isUpcoming(makeWedding('2026-03-31'))).toBe(true);
  });

  it('returns true for a future date', () => {
    expect(isUpcoming(makeWedding('2026-04-15'))).toBe(true);
  });

  it('returns false for a past date', () => {
    expect(isUpcoming(makeWedding('2026-03-30'))).toBe(false);
  });

  it('returns false for a date one year ago', () => {
    expect(isUpcoming(makeWedding('2025-03-31'))).toBe(false);
  });
});
