// parseOcrText is a pure function — mock native modules to prevent import errors
jest.mock('expo-image-picker');
jest.mock('@react-native-ml-kit/text-recognition');

import { parseOcrText } from '../lib/ocr';

// ── 신랑/신부 — Pattern 1 (직접 표기) ────────────────────────────

describe('parseOcrText — Pattern 1 (신랑/신부 키워드)', () => {
  it('기본: 신랑/신부 공백 구분', () => {
    const r = parseOcrText('신랑 홍길동\n신부 김영희');
    expect(r.groom).toBe('홍길동');
    expect(r.bride).toBe('김영희');
  });

  it('반각 콜론 "신랑: 홍길동"', () => {
    const r = parseOcrText('신랑: 홍길동\n신부: 이소연');
    expect(r.groom).toBe('홍길동');
    expect(r.bride).toBe('이소연');
  });

  it('전각 콜론 "신랑：홍길동"', () => {
    const r = parseOcrText('신랑：홍길동\n신부：이소연');
    expect(r.groom).toBe('홍길동');
    expect(r.bride).toBe('이소연');
  });

  it('두 글자 이름 (최솟값)', () => {
    const r = parseOcrText('신랑 이상\n신부 박지');
    expect(r.groom).toBe('이상');
    expect(r.bride).toBe('박지');
  });

  it('다섯 글자 이름 (최댓값)', () => {
    const r = parseOcrText('신랑 남궁민수안\n신부 황보미래나');
    expect(r.groom).toBe('남궁민수안');
    expect(r.bride).toBe('황보미래나');
  });

  it('신랑만 있을 때 → bride는 undefined', () => {
    const r = parseOcrText('신랑 홍길동');
    expect(r.groom).toBe('홍길동');
    expect(r.bride).toBeUndefined();
  });

  it('신부만 있을 때 → groom은 undefined', () => {
    const r = parseOcrText('신부 김영희');
    expect(r.groom).toBeUndefined();
    expect(r.bride).toBe('김영희');
  });

  it('Pattern 1이 있으면 Pattern 2로 덮어쓰지 않음', () => {
    // 신랑/신부가 이미 확정되면 쌍 패턴은 무시
    const r = parseOcrText('신랑 홍길동\n신부 이소연\n이도령 ♡ 성춘향');
    expect(r.groom).toBe('홍길동');
    expect(r.bride).toBe('이소연');
  });
});

// ── 신랑/신부 — Pattern 2 (쌍 패턴) ─────────────────────────────

describe('parseOcrText — Pattern 2 (구분자 쌍)', () => {
  it('♡ 구분자', () => {
    const r = parseOcrText('홍길동 ♡ 김영희');
    expect(r.groom).toBe('홍길동');
    expect(r.bride).toBe('김영희');
  });

  it('♥ 구분자', () => {
    const r = parseOcrText('홍길동 ♥ 김영희');
    expect(r.groom).toBe('홍길동');
    expect(r.bride).toBe('김영희');
  });

  it('❤ 구분자', () => {
    const r = parseOcrText('홍길동 ❤ 김영희');
    expect(r.groom).toBe('홍길동');
    expect(r.bride).toBe('김영희');
  });

  it('& 구분자', () => {
    const r = parseOcrText('홍길동 & 김영희');
    expect(r.groom).toBe('홍길동');
    expect(r.bride).toBe('김영희');
  });

  it('＆ 전각 구분자', () => {
    const r = parseOcrText('홍길동 ＆ 김영희');
    expect(r.groom).toBe('홍길동');
    expect(r.bride).toBe('김영희');
  });

  it('공백 없이 붙어있는 쌍 "홍길동♡김영희"', () => {
    const r = parseOcrText('홍길동♡김영희');
    expect(r.groom).toBe('홍길동');
    expect(r.bride).toBe('김영희');
  });

  it('신랑만 Pattern 1으로 찾은 경우, 신부는 Pattern 2에서 보완', () => {
    const r = parseOcrText('신랑 홍길동\n홍길동 ♡ 김영희');
    expect(r.groom).toBe('홍길동');
    expect(r.bride).toBe('김영희');
  });
});

// ── 신랑/신부 — Pattern 3 (라인 기반) ────────────────────────────

describe('parseOcrText — Pattern 3 (연속 이름 줄)', () => {
  it('연속된 한국어 이름 두 줄 (다른 패턴 없을 때)', () => {
    const r = parseOcrText('결혼을 알립니다\n홍길동\n김영희');
    expect(r.groom).toBe('홍길동');
    expect(r.bride).toBe('김영희');
  });

  it('Pattern 1로 groom이 이미 설정된 경우 groom 덮어쓰지 않음', () => {
    const r = parseOcrText('신랑 홍길동\n이도령\n성춘향');
    expect(r.groom).toBe('홍길동');
    // bride가 없으므로 Pattern 3에서 채워짐.
    // nameLines = ['이도령', '성춘향'], groom 자리(index 0)는 건너뛰고 bride = nameLines[1].
    expect(r.bride).toBe('성춘향');
  });
});

// ── 날짜 파싱 ─────────────────────────────────────────────────

describe('parseOcrText — 날짜', () => {
  it('"2025년 5월 10일" 형식', () => {
    expect(parseOcrText('2025년 5월 10일').date).toBe('2025-05-10');
  });

  it('한 자리 월/일 → 두 자리로 패딩', () => {
    expect(parseOcrText('2025년 1월 5일').date).toBe('2025-01-05');
  });

  it('12월 31일 (연말 경계)', () => {
    expect(parseOcrText('2025년 12월 31일').date).toBe('2025-12-31');
  });

  it('"2025.05.10" 형식 (마침표 구분)', () => {
    expect(parseOcrText('2025.05.10').date).toBe('2025-05-10');
  });

  it('"2025-05-10" 형식 (ISO)', () => {
    expect(parseOcrText('2025-05-10').date).toBe('2025-05-10');
  });

  it('"2025/05/10" 형식 (슬래시 구분)', () => {
    expect(parseOcrText('2025/05/10').date).toBe('2025-05-10');
  });

  it('날짜가 없으면 undefined', () => {
    expect(parseOcrText('홍길동 결혼식').date).toBeUndefined();
  });

  it('날짜만 있는 텍스트 — 나머지는 undefined', () => {
    const r = parseOcrText('2025년 6월 15일에 있습니다.');
    expect(r.date).toBe('2025-06-15');
    expect(r.groom).toBeUndefined();
    expect(r.bride).toBeUndefined();
  });
});

// ── 장소 파싱 ─────────────────────────────────────────────────

describe('parseOcrText — 장소', () => {
  it('"장소: ..." 키워드 형식', () => {
    expect(parseOcrText('장소: 그랜드볼룸').venue).toBe('그랜드볼룸');
  });

  it('"예식장: ..." 키워드 형식', () => {
    expect(parseOcrText('예식장: 더클래식웨딩').venue).toBe('더클래식웨딩');
  });

  it('"웨딩홀: ..." 키워드 형식', () => {
    expect(parseOcrText('웨딩홀: 한화리조트 그랜드볼룸').venue).toBe('한화리조트 그랜드볼룸');
  });

  it('"웨딩 홀: ..." 키워드 형식 (띄어쓰기 포함)', () => {
    expect(parseOcrText('웨딩 홀: 파크하얏트 채플').venue).toBe('파크하얏트 채플');
  });

  it('키워드 없이 "웨딩" 포함 장소명 — 암시적 매칭', () => {
    const r = parseOcrText('서울 그랜드 웨딩');
    expect(r.venue).toBe('서울 그랜드 웨딩');
  });

  it('키워드 없이 "호텔" 포함 장소명', () => {
    const r = parseOcrText('파크 호텔 컨벤션');
    expect(r.venue).toBe('파크 호텔 컨벤션');
  });

  it('키워드 없이 "컨벤션" 포함 장소명', () => {
    const r = parseOcrText('코엑스 컨벤션');
    expect(r.venue).toBe('코엑스 컨벤션');
  });

  it('키워드 없이 "채플" 포함 장소명', () => {
    const r = parseOcrText('성 요셉 채플');
    expect(r.venue).toBe('성 요셉 채플');
  });

  it('장소 없으면 undefined', () => {
    expect(parseOcrText('홍길동 김영희 2025년 5월 10일').venue).toBeUndefined();
  });
});

// ── 엣지 케이스 ───────────────────────────────────────────────

describe('parseOcrText — 엣지 케이스', () => {
  it('빈 문자열 → 모든 필드 undefined', () => {
    const r = parseOcrText('');
    expect(r.groom).toBeUndefined();
    expect(r.bride).toBeUndefined();
    expect(r.date).toBeUndefined();
    expect(r.venue).toBeUndefined();
  });

  it('관련 없는 영문 텍스트 → 모든 필드 undefined', () => {
    const r = parseOcrText('Hello World! This is a test.');
    expect(r.groom).toBeUndefined();
    expect(r.bride).toBeUndefined();
    expect(r.date).toBeUndefined();
    expect(r.venue).toBeUndefined();
  });

  it('실제 청첩장 텍스트 시뮬레이션 — 모든 필드 추출', () => {
    const text = [
      '저희 결혼합니다',
      '신랑 김민준',
      '신부 이수아',
      '2025년 9월 20일 토요일 오후 2시',
      '장소: 서울 웨딩컨벤션 그랜드홀',
    ].join('\n');
    const r = parseOcrText(text);
    expect(r.groom).toBe('김민준');
    expect(r.bride).toBe('이수아');
    expect(r.date).toBe('2025-09-20');
    expect(r.venue).toBeDefined();
  });

  it('쌍 패턴 텍스트 — 날짜/장소 포함', () => {
    const text = [
      '이도령 ♡ 성춘향',
      '2026년 4월 12일',
      '웨딩홀: 남원 하우스웨딩',
    ].join('\n');
    const r = parseOcrText(text);
    expect(r.groom).toBe('이도령');
    expect(r.bride).toBe('성춘향');
    expect(r.date).toBe('2026-04-12');
    expect(r.venue).toBeDefined();
  });
});
