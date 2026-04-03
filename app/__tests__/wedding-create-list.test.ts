// "새 결혼식 추가 → 목록에 표시" 플로우 테스트
//
// createWedding이 올바른 데이터를 DB에 넘기는지,
// getWeddings가 그 데이터를 돌려주는지,
// 예정/지난 탭 필터링이 맞게 동작하는지 검증.

import { createWedding, getWeddings, isUpcoming, type Wedding } from '../lib/db';

// ── Supabase mock ────────────────────────────────────────────

const mockSingle = jest.fn();
const mockSelect = jest.fn(() => ({ single: mockSingle }));
const mockInsert = jest.fn(() => ({ select: mockSelect }));
const mockOrder = jest.fn();
const mockEq = jest.fn(() => ({ order: mockOrder }));
const mockFromSelect = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn((table: string) => {
  if (table === 'weddings') {
    return { insert: mockInsert, select: mockFromSelect };
  }
  return {};
});

const mockGetUser = jest.fn();

jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: { getUser: () => mockGetUser() },
    from: (table: string) => mockFrom(table),
  },
}));

// ── 헬퍼 ────────────────────────────────────────────────────

const USER_ID = 'test-user-123';

function makeWedding(overrides: Partial<Wedding> = {}): Wedding {
  return {
    id: 'wedding-id-1',
    user_id: USER_ID,
    groom: '김민준',
    bride: '박서연',
    date: '2026-04-04',
    venue: '그랜드하얏트 서울',
    attendance: 'attending',
    created_at: '2026-04-04T00:00:00Z',
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } });
});

// ── createWedding ────────────────────────────────────────────

describe('createWedding', () => {
  it('올바른 데이터로 insert 호출 후 생성된 결혼식을 반환한다', async () => {
    const newWedding = makeWedding();
    mockSingle.mockResolvedValue({ data: newWedding, error: null });

    const result = await createWedding({
      groom: '김민준',
      bride: '박서연',
      date: '2026-04-04',
      venue: '그랜드하얏트 서울',
      attendance: 'attending',
    });

    // insert에 user_id가 포함되었는지 확인
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        groom: '김민준',
        bride: '박서연',
        date: '2026-04-04',
        venue: '그랜드하얏트 서울',
        attendance: 'attending',
        user_id: USER_ID,
      })
    );
    expect(result).toEqual(newWedding);
  });

  it('세션 없으면 에러를 던진다', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    await expect(
      createWedding({ groom: '가', bride: '나', date: '2026-01-01', venue: '장소', attendance: 'pending' })
    ).rejects.toThrow('로그인이 필요합니다.');
  });

  it('DB 에러는 그대로 던진다', async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error('duplicate key') });

    await expect(
      createWedding({ groom: '가', bride: '나', date: '2026-01-01', venue: '장소', attendance: 'pending' })
    ).rejects.toThrow('duplicate key');
  });
});

// ── getWeddings ──────────────────────────────────────────────

describe('getWeddings', () => {
  it('생성된 결혼식이 목록에 포함되어 반환된다', async () => {
    const wedding = makeWedding();
    mockOrder.mockResolvedValue({ data: [wedding], error: null });

    const result = await getWeddings();

    expect(mockEq).toHaveBeenCalledWith('user_id', USER_ID);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(wedding);
  });

  it('여러 결혼식이 date 오름차순으로 반환된다', async () => {
    const w1 = makeWedding({ id: 'w1', date: '2026-06-01' });
    const w2 = makeWedding({ id: 'w2', date: '2026-03-15' });
    const w3 = makeWedding({ id: 'w3', date: '2026-12-25' });
    // DB가 이미 정렬해서 반환한다고 가정
    mockOrder.mockResolvedValue({ data: [w2, w1, w3], error: null });

    const result = await getWeddings();

    expect(result.map((w) => w.id)).toEqual(['w2', 'w1', 'w3']);
    // order() 호출 시 ascending: true 인지 확인
    expect(mockOrder).toHaveBeenCalledWith('date', { ascending: true });
  });
});

// ── 탭 필터링: 예정 vs 지난 결혼식 ──────────────────────────

describe('탭 필터링 (index.tsx 로직)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-04T12:00:00Z'));
  });
  afterEach(() => jest.useRealTimers());

  it('오늘 날짜 결혼식은 예정 탭에 표시된다', () => {
    const wedding = makeWedding({ date: '2026-04-04' });
    expect(isUpcoming(wedding)).toBe(true);
  });

  it('미래 결혼식은 예정 탭에 표시된다', () => {
    const wedding = makeWedding({ date: '2026-12-25' });
    expect(isUpcoming(wedding)).toBe(true);
  });

  it('과거 결혼식은 지난 탭에 표시된다', () => {
    const wedding = makeWedding({ date: '2026-04-03' });
    expect(isUpcoming(wedding)).toBe(false);
  });

  it('새로 추가한 결혼식이 예정 탭 카운트에 반영된다', () => {
    const weddings: Wedding[] = [
      makeWedding({ id: 'w1', date: '2026-04-03' }), // 지난
      makeWedding({ id: 'w2', date: '2026-04-04' }), // 예정 (오늘)
      makeWedding({ id: 'w3', date: '2026-06-01' }), // 예정
    ];

    const upcoming = weddings.filter(isUpcoming);
    const done = weddings.filter((w) => !isUpcoming(w));

    expect(upcoming).toHaveLength(2);
    expect(done).toHaveLength(1);
    expect(upcoming.map((w) => w.id)).toContain('w2');
    expect(upcoming.map((w) => w.id)).toContain('w3');
  });

  it('지난 결혼식 탭은 날짜 역순으로 정렬된다 (index.tsx 로직)', () => {
    const weddings: Wedding[] = [
      makeWedding({ id: 'w1', date: '2026-01-10' }),
      makeWedding({ id: 'w2', date: '2025-06-15' }),
      makeWedding({ id: 'w3', date: '2026-03-01' }),
    ];
    // index.tsx: .sort((a, b) => b.date.localeCompare(a.date))
    const sorted = weddings.sort((a, b) => b.date.localeCompare(a.date));
    expect(sorted.map((w) => w.id)).toEqual(['w3', 'w1', 'w2']);
  });
});
