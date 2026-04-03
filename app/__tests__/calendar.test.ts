// expo-calendar와 react-native/Platform을 mock해서 순수 로직만 검증.
jest.mock('expo-calendar');

import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { addWeddingToCalendar } from '../lib/calendar';

const mockCalendar = Calendar as jest.Mocked<typeof Calendar>;

// 공통 파라미터
const baseParams = {
  groom: '홍길동',
  bride: '김영희',
  date: '2025-05-10',
  venue: '그랜드볼룸 웨딩홀',
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ── 권한 ─────────────────────────────────────────────────────

describe('권한 처리', () => {
  it('권한 거부 시 한국어 에러 던짐', async () => {
    (mockCalendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    await expect(addWeddingToCalendar(baseParams)).rejects.toThrow('캘린더 접근 권한이 필요합니다.');
  });

  it('권한 undetermined 시에도 에러 던짐', async () => {
    (mockCalendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
    await expect(addWeddingToCalendar(baseParams)).rejects.toThrow();
  });
});

// ── iOS ───────────────────────────────────────────────────────

describe('iOS', () => {
  beforeEach(() => {
    (Platform as any).OS = 'ios';
    (mockCalendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (mockCalendar.getDefaultCalendarAsync as jest.Mock).mockResolvedValue({ id: 'ios-default-cal' });
    (mockCalendar.createEventAsync as jest.Mock).mockResolvedValue('evt-001');
  });

  it('getDefaultCalendarAsync 호출 (Android 경로 아님)', async () => {
    await addWeddingToCalendar(baseParams);
    expect(mockCalendar.getDefaultCalendarAsync).toHaveBeenCalled();
    expect(mockCalendar.getCalendarsAsync).not.toHaveBeenCalled();
  });

  it('기본 캘린더 ID로 이벤트 생성', async () => {
    await addWeddingToCalendar(baseParams);
    expect(mockCalendar.createEventAsync).toHaveBeenCalledWith(
      'ios-default-cal',
      expect.any(Object)
    );
  });

  it('이벤트 제목은 "신랑 ♥ 신부 결혼식" 형식', async () => {
    await addWeddingToCalendar(baseParams);
    const [, event] = (mockCalendar.createEventAsync as jest.Mock).mock.calls[0];
    expect(event.title).toBe('홍길동 ♥ 김영희 결혼식');
  });

  it('장소는 venue 파라미터와 동일', async () => {
    await addWeddingToCalendar(baseParams);
    const [, event] = (mockCalendar.createEventAsync as jest.Mock).mock.calls[0];
    expect(event.location).toBe(baseParams.venue);
  });

  it('알림은 하루 전 (-1440분)', async () => {
    await addWeddingToCalendar(baseParams);
    const [, event] = (mockCalendar.createEventAsync as jest.Mock).mock.calls[0];
    expect(event.alarms).toEqual([{ relativeOffset: -1440 }]);
  });

  describe('날짜 파싱 — YYYY-MM-DD', () => {
    it('startDate는 해당일 00:00:00', async () => {
      await addWeddingToCalendar(baseParams); // date: '2025-05-10'
      const [, event] = (mockCalendar.createEventAsync as jest.Mock).mock.calls[0];
      expect(event.startDate.getFullYear()).toBe(2025);
      expect(event.startDate.getMonth()).toBe(4);   // 0-indexed: May = 4
      expect(event.startDate.getDate()).toBe(10);
      expect(event.startDate.getHours()).toBe(0);
      expect(event.startDate.getMinutes()).toBe(0);
      expect(event.startDate.getSeconds()).toBe(0);
    });

    it('endDate는 해당일 23:59:59 (allDay 버그 우회)', async () => {
      await addWeddingToCalendar(baseParams);
      const [, event] = (mockCalendar.createEventAsync as jest.Mock).mock.calls[0];
      expect(event.endDate.getFullYear()).toBe(2025);
      expect(event.endDate.getMonth()).toBe(4);
      expect(event.endDate.getDate()).toBe(10);
      expect(event.endDate.getHours()).toBe(23);
      expect(event.endDate.getMinutes()).toBe(59);
      expect(event.endDate.getSeconds()).toBe(59);
    });

    it('연말 경계 — 12월 31일', async () => {
      (mockCalendar.getDefaultCalendarAsync as jest.Mock).mockResolvedValue({ id: 'cal' });
      (mockCalendar.createEventAsync as jest.Mock).mockResolvedValue('evt');
      await addWeddingToCalendar({ ...baseParams, date: '2025-12-31' });
      const [, event] = (mockCalendar.createEventAsync as jest.Mock).mock.calls[0];
      expect(event.startDate.getMonth()).toBe(11); // December = 11
      expect(event.startDate.getDate()).toBe(31);
    });

    it('연초 경계 — 1월 1일', async () => {
      (mockCalendar.getDefaultCalendarAsync as jest.Mock).mockResolvedValue({ id: 'cal' });
      (mockCalendar.createEventAsync as jest.Mock).mockResolvedValue('evt');
      await addWeddingToCalendar({ ...baseParams, date: '2026-01-01' });
      const [, event] = (mockCalendar.createEventAsync as jest.Mock).mock.calls[0];
      expect(event.startDate.getFullYear()).toBe(2026);
      expect(event.startDate.getMonth()).toBe(0);  // January = 0
      expect(event.startDate.getDate()).toBe(1);
    });
  });
});

// ── Android ───────────────────────────────────────────────────

describe('Android', () => {
  beforeEach(() => {
    (Platform as any).OS = 'android';
    (mockCalendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (mockCalendar.createEventAsync as jest.Mock).mockResolvedValue('evt-android');
  });

  function makeCalendar(overrides: Partial<{
    id: string; isPrimary: boolean; allowsModifications: boolean;
    source: { type: string } | null;
  }>) {
    return {
      id: 'cal-1',
      isPrimary: false,
      allowsModifications: true,
      source: null,
      ...overrides,
    };
  }

  it('primary 캘린더 우선 선택', async () => {
    const primary = makeCalendar({ id: 'primary-cal', isPrimary: true });
    const other = makeCalendar({ id: 'other-cal', isPrimary: false });
    (mockCalendar.getCalendarsAsync as jest.Mock).mockResolvedValue([other, primary]);

    await addWeddingToCalendar(baseParams);
    expect(mockCalendar.createEventAsync).toHaveBeenCalledWith('primary-cal', expect.any(Object));
  });

  it('primary 없으면 Google 계정 캘린더 선택', async () => {
    const google = makeCalendar({ id: 'google-cal', source: { type: 'com.google' } });
    const other = makeCalendar({ id: 'other-cal' });
    (mockCalendar.getCalendarsAsync as jest.Mock).mockResolvedValue([other, google]);

    await addWeddingToCalendar(baseParams);
    expect(mockCalendar.createEventAsync).toHaveBeenCalledWith('google-cal', expect.any(Object));
  });

  it('primary/Google 없으면 첫 번째 쓰기 가능 캘린더 선택', async () => {
    const first = makeCalendar({ id: 'first-writable' });
    const second = makeCalendar({ id: 'second-writable' });
    (mockCalendar.getCalendarsAsync as jest.Mock).mockResolvedValue([first, second]);

    await addWeddingToCalendar(baseParams);
    expect(mockCalendar.createEventAsync).toHaveBeenCalledWith('first-writable', expect.any(Object));
  });

  it('쓰기 가능한 캘린더 없으면 "Wediary" 로컬 캘린더 생성', async () => {
    (mockCalendar.getCalendarsAsync as jest.Mock).mockResolvedValue([
      makeCalendar({ id: 'read-only', allowsModifications: false }),
    ]);
    (mockCalendar.createCalendarAsync as jest.Mock).mockResolvedValue('new-wediary-cal');

    await addWeddingToCalendar(baseParams);

    expect(mockCalendar.createCalendarAsync).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Wediary' })
    );
    expect(mockCalendar.createEventAsync).toHaveBeenCalledWith('new-wediary-cal', expect.any(Object));
  });

  it('캘린더 없음 (빈 배열)에서도 Wediary 캘린더 생성', async () => {
    (mockCalendar.getCalendarsAsync as jest.Mock).mockResolvedValue([]);
    (mockCalendar.createCalendarAsync as jest.Mock).mockResolvedValue('new-wediary-cal');

    await addWeddingToCalendar(baseParams);

    expect(mockCalendar.createCalendarAsync).toHaveBeenCalled();
  });

  it('getDefaultCalendarAsync 호출 안 함 (iOS 전용)', async () => {
    (mockCalendar.getCalendarsAsync as jest.Mock).mockResolvedValue([
      makeCalendar({ id: 'cal', isPrimary: true }),
    ]);

    await addWeddingToCalendar(baseParams);
    expect(mockCalendar.getDefaultCalendarAsync).not.toHaveBeenCalled();
  });
});
