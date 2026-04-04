# Wediary — ERD · 기능 스펙 · UX 검수 보고서
**작성일:** 2026-04-03 | **버전:** main@e478c7d | **검수 방법:** 소스코드 분석

---

## 목차
1. [ERD (Entity Relationship Diagram)](#1-erd)
2. [데이터 모델 스펙](#2-데이터-모델-스펙)
3. [화면 및 기능 스펙](#3-화면-및-기능-스펙)
4. [사용자 플로우](#4-사용자-플로우)
5. [UX 검수 — 발견된 이슈](#5-ux-검수--발견된-이슈)
6. [Quick Wins (30분 이내 수정 가능)](#6-quick-wins)
7. [디자인 점수](#7-디자인-점수)

---

## 1. ERD

```
┌─────────────────────────────────────────────────────────────┐
│                        AUTH (Supabase)                      │
│  users                                                      │
│  ├── id (UUID, PK)                                          │
│  ├── email                                                  │
│  └── user_metadata { name, full_name, preferred_username }  │
└────────────────────────┬────────────────────────────────────┘
                         │ user_id (FK)
           ┌─────────────▼──────────────────────────┐
           │             weddings                   │
           │  id          UUID        PK             │
           │  user_id     UUID        FK → users     │
           │  groom       text        NOT NULL       │
           │  bride       text        NOT NULL       │
           │  date        date        NOT NULL       │
           │  venue       text        NOT NULL       │
           │  attendance  enum        NOT NULL       │
           │              'attending'                │
           │              'absent'                   │
           │              'pending'                  │
           │  created_at  timestamptz DEFAULT now()  │
           └─────┬────────────────┬─────────────────┘
                 │                │
    1:1          │                │ 1:N
    ┌────────────▼──────┐   ┌────▼─────────────────┐
    │      memories     │   │       photos          │
    │  id        UUID   │   │  id        UUID       │
    │  wedding_id UUID  │   │  wedding_id UUID      │
    │  user_id   UUID   │   │  user_id   UUID       │
    │  memo      text?  │   │  storage_path text    │
    │  emotion_tags     │   │  created_at timestamptz│
    │    text[]         │   └───────────────────────┘
    │  gift_amount int? │       (max 3 per wedding)
    │  created_at       │
    │  [UNIQUE: wedding_id] ← migration 20260331
    └───────────────────┘

스토리지: supabase storage bucket "wedding-photos"
경로 패턴: {user_id}/{wedding_id}/{timestamp}.{ext}
서명 URL 만료: 3600초 (1시간)
재조회 주기: 55분
```

### 관계 요약

| 관계 | 카디널리티 | 메모 |
|------|-----------|------|
| users → weddings | 1:N | user_id FK |
| weddings → memories | 1:1 | UNIQUE(wedding_id) |
| weddings → photos | 1:N | 최대 3장 제한 (앱 레벨) |
| weddings → users | N:1 | RLS로 user_id 격리 |

---

## 2. 데이터 모델 스펙

### Wedding
| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | Supabase auto-gen |
| user_id | UUID | FK, NOT NULL | 소유자 |
| groom | text | NOT NULL | 신랑 이름 |
| bride | text | NOT NULL | 신부 이름 |
| date | text (YYYY-MM-DD) | NOT NULL | 결혼식 날짜 |
| venue | text | NOT NULL | 웨딩홀 이름 |
| attendance | enum | NOT NULL | attending/absent/pending |
| created_at | timestamptz | DEFAULT now() | 생성 시각 |

### Memory
| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | |
| wedding_id | UUID | FK, UNIQUE | 1:1 관계 |
| user_id | UUID | FK, NOT NULL | |
| memo | text | nullable | 자유 메모 |
| emotion_tags | text[] | NOT NULL, default [] | 감정 태그 |
| gift_amount | int4 | nullable | 축의금 (원) |
| created_at | timestamptz | DEFAULT now() | |

### Photo
| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | |
| wedding_id | UUID | FK | |
| user_id | UUID | FK | |
| storage_path | text | NOT NULL | storage 경로 |
| created_at | timestamptz | DEFAULT now() | |

---

## 3. 화면 및 기능 스펙

### 3.1 로그인 화면 `(auth)/login.tsx`
| 항목 | 스펙 |
|------|------|
| 인증 방식 | Kakao OAuth (Supabase provider) |
| 딥링크 | `wediary://callback` |
| DEV 바이패스 | `__DEV__` 환경에서 로그인 스킵 가능 |
| 로딩 표시 | ActivityIndicator (분홍색) |
| 폰트 | Fredoka Semibold (로고), 시스템 폰트 |

### 3.2 홈 화면 `(app)/index.tsx`
| 항목 | 스펙 |
|------|------|
| 탭 | 예정 / 지난 결혼식 |
| 정렬 | date 오름차순 (DB 쿼리 레벨) |
| 카드 정보 | 신랑♥신부, 날짜, 장소, 참석 여부 |
| 참석 색상 | 참석=lime-400, 불참=white/40, 미정=sky-400 |
| 빈 상태 | 💌 / 📖 이모지 + 안내 문구 |
| FAB | 우하단 + 버튼 (pink-400, glow 효과) |
| 헤더 | 좌: wediary 로고, 우: 설정 |
| 데이터 | React Query `['weddings']` |

### 3.3 새 결혼식 / 수정 `(app)/new.tsx`
| 항목 | 스펙 |
|------|------|
| 자동 입력 | URL 파싱 (Edge Function) / OCR (ML Kit) |
| 필드 | 신랑, 신부, 날짜, 장소, 참석 여부 |
| 필수 필드 | 신랑, 신부, 장소 (날짜는 기본값으로 오늘) |
| 날짜 선택 | iOS: DateTimePicker compact / Android: 모달 |
| 참석 선택 | 라디오 버튼 3개 (참석/불참/미정) |
| 에러 처리 | 인라인 빨간 배너, 스크롤 최상단 이동 |
| 수정 모드 | `?id=` 쿼리로 구분, 기존 데이터 prefill |

### 3.4 결혼식 상세 + 기억 기록 `(app)/[id].tsx`
| 항목 | 스펙 |
|------|------|
| 결혼식 정보 | 이름, 날짜(한국어), 장소, 참석 배지 |
| 캘린더 추가 | 기기 캘린더 앱 연동, 하루 전 알림 |
| 메모 | multiline TextInput |
| 감정 태그 | 6개 고정 (`EMOTION_TAGS`) |
| 축의금 | numeric input + "원" 단위 |
| 사진 | 최대 3장, signed URL (1h), 55분 재조회 |
| 저장 | upsert (memory 1:1) |
| 삭제 | ConfirmModal → 사진 먼저, 웨딩 삭제 |
| 편집 | `/new?id=` 라우트로 이동 |

### 3.5 설정 화면 `(app)/settings.tsx`
| 항목 | 스펙 |
|------|------|
| 표시 정보 | 카카오 이름 + 이메일 |
| 이름 우선순위 | `name` → `full_name` → `preferred_username` |
| 개인정보처리방침 | 인앱 웹뷰 없이 별도 화면으로 라우팅 |
| 로그아웃 | ConfirmModal → `supabase.auth.signOut()` |

### 3.6 특수 기능

#### OCR 파싱 (`lib/ocr.ts`)
| 추출 항목 | 패턴 예시 |
|----------|----------|
| 신랑 이름 | "신랑 홍길동", "홍길동 ♡ 김영희" |
| 신부 이름 | "신부 김영희", 위와 같은 쌍 패턴 |
| 날짜 | "2025년 5월 10일", "2025.05.10" |
| 장소 | "장소:", "예식장:", "웨딩홀:" 접두어 |

#### URL 파싱 (Edge Function)
| 지원 사이트 | 방식 |
|------------|------|
| 네이버 청첩장 | og:title 패턴, JSON 필드 |
| 카카오맵 링크 | 단축 URL 확장 후 스크래핑 |
| 바른손카드 | HTML class/hidden input |
| 기타 | 일반 og:title + 한국어 패턴 |

#### 캘린더 연동 (`lib/calendar.ts`)
| 플랫폼 | 동작 |
|--------|------|
| iOS | 기본 캘린더 사용 |
| Android | primary/Google 캘린더 우선, 없으면 "Wediary" 로컬 캘린더 생성 |
| 알림 | 하루 전 (-1440분) |
| 이벤트 | 종일 이벤트 (00:00-23:59, allDay 버그 우회) |

---

## 4. 사용자 플로우

### Flow 1: 결혼식 추가 (신규)
```
홈 → FAB(+) → 새 결혼식 화면
  ├─ URL 입력 → 불러오기 → 필드 자동완성
  ├─ 청첩장 사진 스캔 → OCR → 필드 자동완성
  └─ 수동 입력
        ↓
  참석 여부 선택 → 저장
        ↓
  홈 (목록 갱신)
```

### Flow 2: 기억 기록
```
홈 → 결혼식 카드 → 상세 화면
  → 메모 작성 + 감정 태그 선택 + 축의금 입력
  → 사진 최대 3장 업로드
  → "기억 저장" 버튼
  → Alert "저장됨 ✓"
```

### Flow 3: 결혼식 수정
```
상세 화면 → 헤더 "편집" → /new?id={id}
  → 기존 데이터 prefill
  → 수정 → 저장
  → 상세 화면 (갱신)
```

### Flow 4: 결혼식 삭제
```
상세 화면 → 헤더 "삭제"
  → ConfirmModal ("사진과 기억도 함께 삭제됩니다.")
  → 확인 → [스토리지 사진 삭제] → [weddings 레코드 삭제]
  → 홈 (목록 갱신)
```

### Flow 5: 캘린더 추가
```
상세 화면 → "📅 캘린더" 버튼
  → 권한 요청
  → 기기 캘린더 이벤트 생성 (하루 전 알림)
  → Alert "캘린더에 추가됨 ✓"
```

### Flow 6: 로그인 / 로그아웃
```
앱 실행 → 세션 없음 → 로그인 화면
  → 카카오로 시작하기 → 외부 브라우저 OAuth
  → wediary://callback → 세션 교환 → 홈

홈 → 설정 → 로그아웃 → ConfirmModal → 로그인 화면
```

---

## 5. UX 검수 — 발견된 이슈

### 🔴 HIGH (사용자 경험/데이터 직접 영향)

---

#### [H-01] 불참 배지 텍스트 대비율 문제 (접근성 버그)

**위치:** `lib/constants.ts`, `(app)/[id].tsx:212`

```typescript
// constants.ts
ATTENDANCE_PILL_BG: absent: 'bg-white/20'  // rgba(255,255,255,0.2) on black
// [id].tsx
<Text className="text-black text-xs font-bold">불참</Text>
```

`bg-white/20`은 순수 검정(`#000`) 배경에서 `rgba(255,255,255,0.2)` = `#333`에 가까운 어두운 회색.
거기에 `text-black`을 쓰면 **거의 보이지 않음** (대비율 ~1.1:1, WCAG 최소 4.5:1 필요).

**수정안:**
```typescript
// absent 배지: 반투명 흰색 배경 + 흰색 텍스트
absent: 'bg-white/10'  // 배경은 유지하되
// 텍스트는 text-white/60 로 변경 (또는 배지 스타일 자체를 개선)
```
또는 홈 카드처럼 색상 배지 없이 텍스트만 사용.

---

#### [H-02] 기억 수정 후 저장 없이 나가면 변경사항 유실

**위치:** `(app)/[id].tsx` 전반

메모, 감정 태그, 축의금을 수정한 후 "기억 저장"을 누르지 않고 뒤로 가면 변경사항이 사라짐. 경고 없음.

모바일 앱에서 흔한 문제. 특히 사진을 찍고 돌아왔을 때 포커스가 이동하면서 실수로 나갈 수 있음.

**수정안 A:** `useEffect`로 변경 여부 추적 → Back 버튼 시 `Alert.alert` 확인
**수정안 B:** 자동 저장 (3초 debounce) — 더 좋은 UX

---

#### [H-03] 홈 화면 에러 상태 없음

**위치:** `(app)/index.tsx:44`

```typescript
const { data: weddings = [], isLoading } = useQuery({ ... });
```

`isError` 처리 없음. 네트워크 오류나 인증 만료 시 빈 목록이 표시되며 유저는 왜 비었는지 알 수 없음.

**수정안:**
```typescript
const { data: weddings = [], isLoading, isError } = useQuery({ ... });
// isError 시 에러 배너 표시
```

---

### 🟡 MEDIUM (폴리시 및 사용성)

---

#### [M-01] 축의금 입력 — iOS에서 소수점 허용

**위치:** `(app)/[id].tsx:281`

```typescript
keyboardType="numeric"  // iOS: 숫자 + 소수점 허용
```

축의금은 정수여야 하는데 `numeric`은 iOS에서 `3.5` 같은 소수 입력이 가능. `number-pad`를 써야 함.

**수정안:**
```typescript
keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
```

---

#### [M-02] 축의금 표시 — 숫자 포맷팅 없음

**위치:** `(app)/[id].tsx`

`gift_amount`가 `100000`으로 저장되는데, 읽을 때도 `100000원`으로 표시됨. 한국에서는 `100,000원`이 표준.

상세 화면에서 저장된 금액을 다시 불러올 때 텍스트 인풋에 raw number가 들어가는 것도 동일.

**수정안:** 저장/불러오기 시 `toLocaleString('ko-KR')` 적용 또는 별도 포맷 함수 추가.

---

#### [M-03] OCR 스캔 — 불필요한 Alert 단계

**위치:** `(app)/new.tsx:145–157`

"청첩장 사진으로 스캔" 버튼을 누르면 `Alert.alert`이 뜨며 카메라/갤러리 선택을 요청. 모달 → 모달 순서.

**수정안:** 버튼 두 개로 분리 (아이콘 포함)
```tsx
<TouchableOpacity onPress={() => handleScan('camera')}>📷 카메라</TouchableOpacity>
<TouchableOpacity onPress={() => handleScan('gallery')}>🖼 갤러리</TouchableOpacity>
```

---

#### [M-04] 참석 여부 — 상세 화면에서 바로 변경 불가

**위치:** `(app)/[id].tsx`

참석 여부를 바꾸려면 편집 화면으로 이동해야 함. 이것이 가장 자주 바뀌는 필드임에도 2단계 탐색이 필요.

**수정안:** 상세 화면의 배지를 탭하면 바로 변경되는 인라인 선택기 제공.

---

#### [M-05] 메모리 로딩 스켈레톤 없음

**위치:** `(app)/[id].tsx`

결혼식 상세 진입 시 `wLoading`만 체크하고 `memory` 로딩 상태는 따로 처리하지 않음. 기억 섹션이 비어 있다가 데이터가 채워지는 레이아웃 점프가 발생할 수 있음.

---

#### [M-06] 빈 상태 — "지난 결혼식" 탭 도움말 없음

**위치:** `(app)/index.tsx:34`

```typescript
// "done" 탭 빈 상태
<Text className="text-white/40 text-sm mt-2">아직 기록이 없어요</Text>
// "upcoming" 탭에는 있는 이 줄이 "done" 탭엔 없음:
<Text className="text-white/20 text-xs mt-1">오른쪽 아래 + 버튼으로 추가해보세요</Text>
```

"지난 결혼식" 탭 빈 상태에는 추가 도움말이 없어 "이게 왜 비었지?" 혼란 가능.

---

#### [M-07] 삭제 후 photos → memories DB 레코드 미삭제

**위치:** `lib/db.ts:deleteWeddingPhotos`, `deleteWedding`

```typescript
// deleteWeddingPhotos: Storage에서만 삭제, photos 테이블 레코드는 남음
// deleteWedding: weddings 레코드 삭제 (CASCADE 여부 불명)
```

`deleteWeddingPhotos`는 Storage에서 파일만 제거하고 `photos` 테이블의 레코드를 삭제하지 않음. `weddings` 삭제 시 `memories`, `photos` 레코드가 CASCADE로 지워지는지 DB 레벨에서 확인 필요.

**수정안:** DB에 `ON DELETE CASCADE` 추가, 또는 앱에서 명시적으로 삭제:
```typescript
await supabase.from('photos').delete().eq('wedding_id', weddingId);
await supabase.from('memories').delete().eq('wedding_id', weddingId);
```

---

### 🟢 POLISH (디테일 개선)

---

#### [P-01] 설정 화면 — 앱 버전 없음
설정 화면에 앱 버전 표시가 없어 CS 대응, 버그 신고 시 버전 확인이 어려움.

#### [P-02] ConfirmModal — message 없을 때 여백 처리 어색
```typescript
{!message && <View className="mb-4" />}
```
현재 두 곳에서 `message`가 항상 있으므로 실질적 문제는 없으나, API 일관성 측면에서 `message`를 required로 변경하거나 조건을 단순화하는 게 깔끔.

#### [P-03] 상세 화면 헤더 — 제목 없음
`ScreenHeader`의 `center`가 비어있어 어떤 결혼식을 보고 있는지 헤더에서 확인 불가. 스크롤 시 이름이 사라짐.

#### [P-04] 축의금 — 퀵셀렉트 없음
5만, 10만, 20만원 등 자주 쓰는 금액 퀵셀렉트 칩 제공 시 입력 속도 향상.

#### [P-05] 사진 추가 — 카메라 직접 촬영 없음
현재 갤러리 선택만 가능. `launchCameraAsync` 옵션 추가 시 당일 현장 사진 바로 추가 가능.

#### [P-06] 날짜 오름차순 정렬 — "예정" 탭 적합, "지난" 탭은 역순이 더 자연스러움
가장 최근에 다녀온 결혼식이 위에 오는 게 "지난 결혼식" 탭에서는 더 자연스러운 UX.

---

## 6. Quick Wins

**30분 이내 수정 가능한 고우선순위 이슈:**

| 순서 | 이슈 | 파일 | 예상 시간 |
|------|------|------|---------|
| 1 | **H-01** 불참 배지 텍스트 대비율 | `lib/constants.ts` | 5분 |
| 2 | **M-01** iOS 축의금 number-pad | `(app)/[id].tsx` | 3분 |
| 3 | **M-06** 빈 상태 도움말 | `(app)/index.tsx` | 5분 |
| 4 | **M-03** OCR 버튼 분리 | `(app)/new.tsx` | 15분 |
| 5 | **H-03** 홈 에러 상태 | `(app)/index.tsx` | 10분 |

---

## 7. 디자인 점수

### 종합 평가

| 카테고리 | 등급 | 비고 |
|----------|------|------|
| 시각 계층 | B | 탭/카드/FAB 계층 명확. 상세 화면은 섹션 구분 약함 |
| 타이포그래피 | B+ | Fredoka + 시스템 폰트 조합. 한국어 메인, 영어 브랜드 일관성 있음 |
| 색상/대비 | C+ | 전반적으로 좋으나 H-01 불참 배지 버그 |
| 간격/레이아웃 | B | 8px 기반 consistent. 모바일 우선으로 잘 설계됨 |
| 인터랙션 상태 | B- | active:opacity-70 있음. 로딩/에러 상태 일부 누락 |
| 반응형 | A- | 모바일 전용 앱. web max-width 430px 설정 |
| 컨텐츠/마이크로카피 | B | 한국어 자연스러움. 일부 에러 메시지 추상적 |
| AI Slop 탐지 | A | 다크테마 + 핑크 포인트. AI 생성 느낌 없음. 독자적 톤 |
| 모션/애니메이션 | C | ConfirmModal fade 외 실질적 트랜지션 없음 |
| 성능 체감 | B | Signed URL 사전 갱신, React Query 캐싱 |

**전체 디자인 점수: B**
**AI Slop 점수: A** — 핑크/블랙 Y2K 팔레트, 이모지 포인트 사용이 자연스럽고 의도적. AI 템플릿 느낌 없음.

### 총평

Wediary는 명확한 목적을 가진 단순한 앱으로, 현재 디자인 구현 수준이 기능 대비 높은 편. 주요 이슈는 **접근성 버그(H-01)** 와 **데이터 보존(H-02, M-07)** 에 집중되어 있음. 시각 디자인 자체는 의도가 명확하고 일관성 있게 구현됨.

---

*보고서 경로: `.gstack/design-reports/wediary-erd-spec-ux-audit-2026-04-03.md`*
