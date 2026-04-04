# Design System — wediary

## Product Context
- **What this is:** 결혼식 청첩장 관리 모바일 앱 — 참석할 결혼식을 기록하고, 축의금을 추적하고, 기억을 남기는 공간
- **Who it's for:** 결혼식에 자주 참석하는 한국 사용자 (20-40대)
- **Space/industry:** 개인 기록, 소셜 관계 관리, 웨딩 카테고리
- **Project type:** 모바일 앱 (React Native / Expo, iOS + Android 우선)

## Aesthetic Direction
- **Direction:** Y2K Clean — 야간 다이어리, 개인 앨범. 핫핑크와 블랙으로 선명하게.
- **Decoration level:** Minimal — 타이포그래피와 색이 일을 하고, 불필요한 일러스트나 그라데이션 없음
- **Mood:** 깊은 밤에 혼자 꺼내 보는 다이어리. 감성적이지만 정돈된 느낌. 결혼식 앨범이 디지털화된 것 같은 분위기.
- **Design rationale:** 경쟁 앱들이 전부 흰 배경 + 파스텔 핑크인 이유는 "결혼식 준비 서비스"를 파는 앱이기 때문. wediary의 사용자는 결혼식 이후의 기억을 간직하는 사람 — 블랙 + 핫핑크는 개성 있고 기억에 남는다.

## Typography

| 역할 | 폰트 | 용도 |
|------|------|------|
| **Brand/Logo** | Fredoka 600 | "wediary" 로고, 앱 워드마크 |
| **감성 포인트** | Gaegu 700 / 400 | 커플 이름, 결혼식 카드 제목 **만** (선택적 사용 필수) |
| **UI / 본문** | Pretendard Variable | 모든 UI 텍스트, 날짜, 장소, 메모 |
| **숫자 / 축의금** | Pretendard Variable (tabular-nums) | 금액 표시 (`font-variant-numeric: tabular-nums`) |

**핵심 규칙:** Gaegu는 커플 이름과 결혼식 제목에만 — 전체에 쓰면 장난스러워짐. Pretendard가 UI의 주력.

**Scale:**
- display: 26px / 700 (상세 화면 커플 이름)
- heading: 22px / 700 (섹션 제목)
- body: 15px / 400, line-height 1.6
- label: 13px / 600
- caption: 11px / 600, letter-spacing 0.08em

**Loading (web/Expo):** Google Fonts CDN (Fredoka, Gaegu) + Pretendard CDN (`cdn.jsdelivr.net/gh/orioncactus/pretendard`)

## Color

**Approach:** Restrained — 2개 포인트 컬러(핫핑크, 라임), 나머지는 블랙/화이트 계열

| 토큰 | 값 | 용도 |
|------|-----|------|
| `background` | `#000000` | 앱 배경 |
| `surface` | `#111111` | 카드, 바텀시트, 인풋 |
| `surface-alt` | `#1A1A1A` | 섹션 구분, 호버 상태 |
| `text` | `#FFFFFF` | 주요 텍스트 |
| `text-muted` | `#A3A3A3` | 보조 정보, 라벨 |
| `text-faint` | `#616161` | 힌트, 섹션 레이블 |
| `border` | `#2A2A2A` | 구분선, 카드 테두리 |
| **`accent`** | **`#FF1493`** | **핫핑크 — CTA, D-day 뱃지, 포인트** |
| `accent-light` | `#3D0A1E` | 핫핑크 배경 (불참 태그 등) |
| **`attending`** | **`#CCFF00`** | **라임 — 참석 상태 표시** |
| `attending-light` | `#1A2600` | 라임 배경 |
| `absent` | `#FF1493` | 불참 = accent와 동일 |
| `undecided` | `#616161` | 미정 상태 |

**참석 카드 border-left 색:**
- 참석: `#CCFF00` (lime)
- 불참: `#FF1493` (hot pink)
- 미정: `#2A2A2A` (border, 기본)

**Dark mode:** 이 앱은 기본이 다크. 라이트 모드 없음.

## Spacing

- **Base unit:** 8px
- **Density:** Comfortable (한국 앱 정보 밀도 기준 — 여백보단 숨쉬는 공간)

| 토큰 | 값 |
|------|----|
| 2xs | 2px |
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |
| 3xl | 64px |

## Layout

- **Approach:** Card-based, bottom tab navigation
- **Grid:** 단일 컬럼 (모바일 전용)
- **Max content width:** 화면 너비 (React Native)
- **Bottom tab:** 텍스트 라벨 필수 (한국 사용자 기대치)
- **CTA button:** 하단 풀너비 (padding: 16px, border-radius: pill 또는 lg)

**Border Radius (기존 tailwind.config.js와 일치):**

| 토큰 | 값 | 사용처 |
|------|-----|--------|
| `card` (rounded-2xl) | 16px | 결혼식 카드, 설정 섹션 |
| `input` (rounded-xl) | 12px | 인풋, 버튼 |
| `tab` (rounded-lg) | 8px | 탭 아이템 |
| `pill` (rounded-full) | 9999px | 참석 뱃지, D-day 뱃지, 태그 |

## Motion

- **Approach:** Minimal-functional — 불필요한 애니메이션 없음
- **허용 모션:** 화면 전환(slide), 바텀시트 열기/닫기, 버튼 press 피드백
- **금지:** 입장 애니메이션 루프, 스크롤 파랄락스, 장식적 로티

**Duration:**
- micro: 50-100ms (버튼 press)
- short: 150-250ms (화면 전환)
- medium: 250-400ms (바텀시트)

**Easing:** enter: `ease-out` / exit: `ease-in` / move: `ease-in-out`

## Component Guidelines

### Wedding Card
```
border-left: 3px solid <attending-color>
background: surface (#111111)
border-radius: card (16px)
padding: 16px
```
커플 이름 → Gaegu 700, 날짜/장소 → Pretendard, 축의금 → Pretendard tabular-nums

### D-day Badge
```
background: accent (#FF1493)
color: white
font: Pretendard 700
border-radius: pill
padding: 3px 8px
```

### Attendance Tags
- 참석: lime bg `#1A2600` + lime text `#CCFF00`
- 불참: pink bg `#3D0A1E` + pink text `#FF1493`
- 미정: gray bg `#1A1A1A` + gray text `#616161`

### Buttons
- Primary: `background: #FF1493, color: white, border-radius: input`
- Secondary: `background: #3D0A1E, color: #FF1493`
- Ghost: `background: transparent, border: 1px solid #2A2A2A, color: #A3A3A3`
- CTA (하단 풀너비): `padding: 16px, font-size: 16px, font-weight: 700`

## Anti-patterns (금지)

- 흰 배경 (#FFF) — 이 앱의 아이덴티티를 지움
- 파스텔 핑크 (#FFB6C1 류) — 경쟁 앱과 구분 불가
- 보라/violet gradient — AI 슬롭
- Gaegu를 모든 텍스트에 사용 — 장난스럽고 읽기 어려움
- Inter / Roboto / Noto Sans KR — 개성 없음
- 화면 진입마다 애니메이션 — 기능 앱에 부적합

## Decisions Log

| 날짜 | 결정 | 근거 |
|------|------|------|
| 2026-04-04 | Y2K Clean 방향 확정 | 기존 tailwind.config, 앱 아이콘과 일관성. 경쟁 앱과 차별화. |
| 2026-04-04 | Pretendard UI 폰트 도입 | Noto Sans KR 후계, 2024 한국 앱 표준, 가독성 우수 |
| 2026-04-04 | Gaegu는 감성 포인트에만 | 전체 사용 시 장난스러움, 선택적 사용으로 특별함 유지 |
| 2026-04-04 | 라임(#CCFF00) = 참석 표시 | 핫핑크와 대비 명확, 기존 lime-400 팔레트 활용 |
