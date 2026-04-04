# wediary TODOs

---

## 다음 세션 작업

### UI 디자인 수정 (2026-04-04 audit)

Android 에뮬레이터 스크린샷 기반으로 발견한 문제들. 임팩트 순.

#### 홈 화면
- [x] **D-01** `index.tsx` — WeddingCard 배경색 + border 추가 (`bg-white/10 border-white/20`)
- [x] **D-02** `index.tsx` — 참석 여부 뱃지 pill 스타일 적용 (ATTENDANCE_PILL_BG/TEXT 사용)

#### 상세 화면
- [x] **D-03** `[id].tsx` — 캘린더 버튼 border 강조 (`border-white/30`)
- [x] **D-04** `[id].tsx` — 감정 칩 + 축의금 칩 비선택 대비 개선 (`bg-white/10 border-white/20`)
- [x] **D-05** `[id].tsx` — 사진 추가 버튼 solid border (`border-white/25`)

#### 새 결혼식 폼
- [x] **D-06** `new.tsx` — 입력 필드 border 강화 (`border-white/20`)
- [x] **D-07** `new.tsx` — 날짜 표시 형식 `2026년 4월 4일` 한국어 형식 적용

### 개인정보처리방침 실제 정보 설정

- [ ] **privacy.tsx 5번 섹션** — "성명: 김리바", "이메일: lyva.kim@example.com" 을 실제 앱 서비스 담당자 이름 + 실제 연락 이메일로 교체 (현재 placeholder 상태)

---

### 실기기 검증 필요 기능 (3종)

네이티브 권한/API가 필요해서 웹에서 테스트 불가. iOS 실기기 또는 시뮬레이터 필요.

- [ ] **캘린더 자동 추가** — 상세 화면 "캘린더" 버튼 탭 → 권한 요청 → 캘린더 앱에 이벤트 등록 확인 (시간 정보 있을 때 정확한 시간 반영 여부도 확인)
- [ ] **OCR 스캔** — "카메라 촬영" / "갤러리 선택" → 청첩장 이미지 인식 → 신랑/신부/날짜/장소 자동 입력 확인 (기존 입력값 덮어쓰지 않는지도 확인)
- [ ] **모바일 청첩장 파싱** — 청첩장 URL 입력 → "불러오기" → parse-invitation Edge Function 호출 → 폼 자동 완성 확인 (기존 입력값 덮어쓰지 않는지도 확인)

---

### 네이티브 앱 QA (iOS 시뮬레이터 or 실기기)

웹 테스트 로그인(`router.replace('/(app)')`)이 Supabase 세션을 생성하지 않아서,
웹 브라우저에서는 데이터 화면 테스트가 불가능합니다.
아래 기능들은 실제 로그인된 네이티브 앱에서 직접 확인 필요:

- [ ] **[id].tsx 신규 기능 전체** — 실기기 or 시뮬레이터 + 카카오 로그인 후 확인
  - 축의금 입력 시 숫자 포맷팅 (100000 → raw 입력, 하단 미리보기 100,000원)
  - [x] 참석여부 배지 탭 → 인라인 선택기 → 즉시 저장 (**완료 2026-04-04**)
  - 기억 수정 후 뒤로 누르면 "나가기" 경고 Alert
  - 상세 화면 헤더 중앙에 이름 표시 (스크롤 시에도)
- [ ] **홈 화면** — 결혼식 목록 로딩, 예정/지난 탭 전환, 지난 탭 날짜 역순
- [ ] **결혼식 삭제** — photos + memories DB 레코드까지 삭제되는지 확인

### 웹 테스트 로그인 개선 (선택)

웹 QA를 제대로 하려면 테스트 로그인이 실제 Supabase 익명 세션을 만들어야 함.
`supabase.auth.signInAnonymously()` 사용 or 테스트 계정 하드코딩 고려.

---

## 완료 내역

### 2026-04-04 (엣지케이스 & UX 전수조사)

- [x] **P0** `[id].tsx` — 로딩 완료 후 wedding 없으면 무한 스피너 → `isError` 분리, 에러 화면 + 돌아가기 버튼
- [x] **P1** `new.tsx` — 신랑/신부 이름 둘 다 비워도 저장 가능 → 저장 전 validation, 에러 배너 표시
- [x] **P1** `[id].tsx` — invite_url 정적 표시만 → 탭=브라우저 열기, 길게 누르기=클립보드 복사
- [x] **P1** `index.tsx` — 에러 시 재시도 방법 없음 → "다시 시도" 버튼 + `refetch()` 호출
- [x] **P1** `settings.tsx` — `signOut()` await 없음, 실패 무시 → await 추가, 실패 시 Alert
- [x] **P1** `new.tsx` — 취소 시 입력 내용 경고 없이 사라짐 → `beforeRemove` 리스너로 dirty 체크
- [x] **P2** `[id].tsx` — 지난 결혼식에도 캘린더 추가 버튼 표시 → `isUpcoming(wedding)` 조건부 렌더링
- [x] **P2** `[id].tsx` — venue 빈 문자열일 때 장소 행 + 복사 버튼 보임 → `wedding.venue` falsy면 행 전체 숨김
- [x] **P2** `calendar.ts` — 결혼식 시간 있어도 항상 종일 이벤트 → `time` 파라미터 추가, 있으면 정확한 시간+2시간 범위로 등록
- [x] **P2** `new.tsx` — URL/OCR 파싱이 기존 입력값 덮어씀 → 비어있는 필드만 채움 + URL 형식(http/https) 사전 검증
- [x] **P2** `[id].tsx` — 참석여부 뱃지 정적 표시 → 탭 시 인라인 3-버튼 선택기, 즉시 DB 저장
- [x] **P3** `index.tsx` — D-Day 배지 60일 이상 미표시 → 60일 제한 제거, 모든 예정 결혼식에 표시

### 2026-04-04

- [x] 사진 저장 기능 제거 — `[id].tsx`에서 PhotoCard, photos query, ImagePicker, 사진 관련 DB 함수 전부 제거
- [x] 상세 화면 헤더 아이콘화 — 뒤로(chevron-back), 편집(create-outline), 삭제(trash-outline) Ionicons으로 교체 (`[id].tsx`)
- [x] D-Day 카운트다운 — 홈 목록 카드(D-N 뱃지) + 상세 화면 히어로 섹션(D-Day/D-N/N일 전) 표시 (`index.tsx`, `[id].tsx`)
- [x] invite_url DB 컬럼 추가 + 상세 화면 링크 표시 — `weddings` 테이블 `invite_url TEXT` 마이그레이션, 상세에서 link-outline 아이콘과 함께 표시 (`db.ts`, `[id].tsx`, migration)
- [x] 새 결혼식 저장 필수값 검증 제거 — handleSave에서 validation 로직 삭제 (`new.tsx`)
- [x] 홈 목록 카드 정렬 개선 — D-Day와 날짜 inline 배치, 참석 뱃지 오른쪽 단독 배치 (`index.tsx`)
- [x] 참석 뱃지 NativeWind 정적 분석 호환 — 동적 클래스 템플릿 → explicit ternary chain으로 교체 (`index.tsx`)
- [x] UI 디자인 D-01~D-07 전체 완료 — 카드 배경/border, 뱃지 스타일, 캘린더 버튼 border, 입력 border, Android 날짜 한국어 형식
- [x] iOS 스와이프 백 제스처 isDirty 경고 누락 수정 — `navigation.addListener('beforeRemove')` 패턴으로 버튼 탭 + 네이티브 스와이프 제스처 모두 인터셉트 (`[id].tsx`)
- [x] 불러오기 버튼 비활성 시각 피드백 — 입력 없을 때 `bg-pink-400/40` + `text-black/40` 적용 (`new.tsx`)
- [x] 테스트 로그인 `signInAnonymously()` 교체 — `router.replace('/(app)')` 제거, 실제 Supabase 익명 세션 생성으로 DB 쓰기 가능 (`login.tsx`)
- [x] 새 결혼식 추가 → 목록 표시 플로우 테스트 10개 추가 (`__tests__/wedding-create-list.test.ts`)
- [x] 한국어 라벨 `uppercase tracking-widest` 완전 제거 — FINDING-004 누락분: `[id].tsx` 5개, `new.tsx` 1개, `settings.tsx` 2개, `privacy.tsx` 제목
- [x] 저장/캘린더 성공 Alert → 인라인 피드백 교체 — 버튼 2초간 lime "저장됨 ✓", 캘린더 칩 "추가됨 ✓" (`[id].tsx`)
- [x] 사진 추가 `+` 버튼 가시성 개선 — `text-white/30` → `text-pink-400 font-bold` (`[id].tsx`)
- [x] 개인정보처리방침 row `›` chevron 추가 (`settings.tsx`)
- [x] 커플 이름 Gaegu 폰트 적용 — WeddingCard + 상세 히어로 `font-gaegu-bold` (`index.tsx`, `[id].tsx`)
- [x] 홈 설정 버튼 가시성 개선 — `text-white/40` → `text-white/60` (`index.tsx`)
- [x] 브랜드 일관성 회귀 테스트 9개 추가 (`__tests__/brand.test.ts`)

### 2026-04-03 (2차)

- [x] H-02: 기억 수정 후 저장 없이 나가면 변경사항 유실 — isDirty 감지 + Alert
- [x] M-02: 축의금 숫자 포맷팅 (toLocaleString ko-KR)
- [x] M-03: OCR 스캔 버튼 카메라/갤러리 두 개로 분리
- [x] M-04: 참석 여부 인라인 선택기 (배지 탭 → inline toggle)
- [x] M-07: deleteWeddingPhotos에 DB 레코드 삭제 추가, deleteWedding에 memories 삭제 추가
- [x] P-01: 설정 화면 앱 버전 표시 (expo-constants)
- [x] P-03: 상세 화면 ScreenHeader center에 이름 표시
- [x] P-05: 사진 추가 시 카메라/갤러리 선택 Alert
- [x] P-06: 지난 결혼식 탭 날짜 역순 정렬 (index.tsx)

### 2026-04-03 (1차)

- [x] H-01: 불참 배지 텍스트 대비율 수정 (commit: 2f2d9a5)
- [x] M-01: iOS 축의금 number-pad 키보드 (commit: f24539a)
- [x] M-06: 지난 결혼식 빈 상태 도움말 (commit: f24539a)
- [x] H-03: 홈 에러 상태 없음 (commit: f24539a)
- [x] EAS Build 설정 완료 (projectId: a9bf549f)
- [x] Kakao OAuth 구현
- [x] Android 에뮬레이터 로컬 빌드 (Java 17)
- [x] UI 일관성 수정 (new.tsx, [id].tsx)

### 2026-04-02

- [x] FINDING-001: 빈 상태 FAB 안내 텍스트 추가 (commit: 08d8039)
- [x] FINDING-002: 접근성(Accessibility) 전체 추가 (commit: 0bbb8cf)
- [x] FINDING-003: FAB + 아이콘 font-bold (commit: 171bf4e)
- [x] FINDING-004: 한국어 섹션 레이블 uppercase 제거 (commit: 315dd19)
- [x] FINDING-005: 스캔 버튼 이모지 제거 (commit: 456130b)
- [x] FINDING-006: KAKAO_YELLOW 상수화 (commit: 997c4e5)
- [x] DESIGN-TODO-001: 공유 ScreenHeader 컴포넌트 추출 (commit: bf5bb08)
- [x] DESIGN-TODO-002: border-radius 시맨틱 토큰 추가 (commit: 5e3bbbc)
- [x] DESIGN-TODO-003: 커스텀 폰트 도입 (commit: 73e6278)
- [x] ISSUE-001: DEV 캘린더 테스트 버튼 설정화면 노출 (commit: bd3e364)
- [x] ISSUE-002: 저장 실패 에러 배너 스크롤 위에 숨김 (commit: 1f2f818)
- [x] parse-invitation Edge Function 버그 수정 (commit: 9ad278c, 185fa2e)
- [x] OCR 스캔 기능 추가 (commit: 7f75c68)
- [x] 캘린더 연동 기능 추가 (commit: 7f75c68, 9879f98, 2ba0139)
- [x] Android 에뮬레이터 세팅 완료

### 2026-03-31

- [x] signed URL 만료 시 자동 갱신 (commit: c804bba)
- [x] memories 테이블 wedding_id UNIQUE 제약 (commit: 6ff4993)
- [x] 테스트 인프라 설정 (commit: 437b2c0)
- [x] Phase 5-03 App Store Prep (privacy.tsx, eas.json, app-store-metadata.md)
- [x] FINDING-001~005, 007 Design findings (commit: 768a2d1 등)
