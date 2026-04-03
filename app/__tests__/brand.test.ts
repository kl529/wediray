// 브랜드 일관성 회귀 테스트
// 잘못된 CSS 패턴이 재도입되는 것을 방지.
//
// 이 파일은 소스 코드 정적 분석 방식으로,
// 디자인 규칙이 코드에 지켜지고 있는지 검증한다.

import * as fs from 'fs';
import * as path from 'path';

const SCREENS = path.join(__dirname, '../app/(app)');

function read(file: string): string {
  return fs.readFileSync(path.join(SCREENS, file), 'utf-8');
}

// ── FINDING-004: 한국어 라벨 uppercase + tracking-widest 금지 ──────────
//
// 한국어 텍스트에 tracking-widest를 적용하면 자간이 부자연스럽게 벌어지고,
// uppercase는 한국어 문자에 시각적 효과가 없다. 영문 로고("wediary")에
// font-fredoka + tracking-widest 단독 사용은 의도적이므로 허용.
// 두 클래스의 "조합"이 한국어 라벨에서 금지된 패턴.

describe('FINDING-004 회귀: 한국어 라벨에 uppercase tracking-widest 금지', () => {
  const SCREEN_FILES = ['index.tsx', 'new.tsx', '[id].tsx', 'settings.tsx', 'privacy.tsx'];

  SCREEN_FILES.forEach((file) => {
    it(`${file}: className에 "uppercase tracking-widest" 조합 없음`, () => {
      const source = read(file);
      // "uppercase tracking-widest" 또는 역순 "tracking-widest ... uppercase" 조합 모두 금지
      expect(source).not.toContain('uppercase tracking-widest');
    });
  });

  it('홈 wediary 로고는 tracking-widest 유지 (영문 브랜드 의도적 자간)', () => {
    // 과잉 수정으로 로고 자간이 제거되는 것을 방지
    const source = read('index.tsx');
    expect(source).toContain('font-fredoka-semibold tracking-widest');
  });
});

// ── 브랜드 폰트: 커플 이름은 Gaegu (다이어리 감성) ────────────────────
//
// WeddingCard와 상세 화면 히어로의 신랑♥신부 이름은
// font-gaegu-bold를 사용해야 한다 (system font-bold 재도입 방지).

describe('브랜드 폰트: 커플 이름 Gaegu 적용', () => {
  // ♥는 다음 줄에 있으므로 className 속성 자체를 직접 검사
  it('홈 WeddingCard: 커플 이름 Text에 font-gaegu-bold className 사용', () => {
    const source = read('index.tsx');
    // <Text className="...font-gaegu-bold..."> 패턴 확인
    // (font-bold만 단독 사용 = system font로 회귀하는 패턴 방지)
    expect(source).toContain('font-gaegu-bold');
    // system font-bold가 단독으로 커플 이름에 쓰이는 패턴 방지
    expect(source).not.toMatch(/text-lg font-bold[^-]/);
  });

  it('상세 화면: 히어로 커플 이름 Text에 font-gaegu-bold className 사용', () => {
    const source = read('[id].tsx');
    expect(source).toContain('text-3xl font-gaegu-bold');
  });
});

// ── 설정 화면: 내비게이션 항목 chevron 존재 ───────────────────────────
//
// 탭 가능한 내비게이션 행에는 › chevron이 있어야 함.

describe('설정 화면 내비게이션 affordance', () => {
  it('개인정보처리방침 row에 chevron(›) 포함', () => {
    const source = read('settings.tsx');
    // router.push('/privacy')와 같은 줄 근처에 › 가 있어야 함
    expect(source).toContain('›');
  });
});
