# wediary TODOs

---

## 다음 세션 작업

### 🐛 린터 이상동작 (긴급)

- [x] **import 자동 제거** — ESLint가 아닌 VS Code "Organize Imports on Save" 기능이 원인. `.vscode/settings.json` 으로 `source.organizeImports: never`, `source.removeUnusedImports: never` 설정 완료. (참고: `index.tsx`는 UX 리팩터 후 `ATTENDANCE_BORDER`만 사용 중으로 이미 올바른 상태였음)

### 개인정보처리방침 실제 정보 설정

- [x] **privacy.tsx 5번 섹션** — 성명: 김지원, 이메일: lyva@grwks.com 으로 교체 완료

### 실기기 검증 필요 (네이티브 전용)

- [ ] **SC-14: 캘린더 자동 추가** — 권한 요청 → 이벤트 등록 확인
- [ ] **SC-13: OCR 갤러리 스캔** — 청첩장 이미지 인식 → 폼 자동 입력
- [ ] **SC-12 심층: 실제 청첩장 URL 파싱** — 카카오/웨딩21/더카드 등 실제 URL로 검증
- [x] **결혼식 삭제** — memories → photos(storage+DB) → weddings 순 삭제 코드 확인 (PASS)
- [x] **기억 수정 후 뒤로가기 경고 Alert** — beforeRemove 네이티브 스와이프 PASS. 커스텀 버튼 이중 confirm 버그 → bypassBeforeRemove ref로 수정
- [x] **축의금 숫자 포맷팅** — toLocaleString('ko-KR') 사용 중, "100,000원" 미리보기 정상 (PASS)
- [x] **상세 헤더 이름 스크롤 유지** — ScreenHeader가 ScrollView 밖에 고정됨 (PASS)

---

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

- [x] **privacy.tsx 5번 섹션** — 성명: 김지원, 이메일: lyva@grwks.com 으로 교체 완료

---

### 실기기 검증 필요 기능 (3종)

네이티브 권한/API가 필요해서 웹에서 테스트 불가. iOS 실기기 또는 시뮬레이터 필요.

- [ ] **캘린더 자동 추가** — 상세 화면 "캘린더" 버튼 탭 → 권한 요청 → 캘린더 앱에 이벤트 등록 확인 (시간 정보 있을 때 정확한 시간 반영 여부도 확인)
- [ ] **OCR 스캔** — "카메라 촬영" / "갤러리 선택" → 청첩장 이미지 인식 → 신랑/신부/날짜/장소 자동 입력 확인 (기존 입력값 덮어쓰지 않는지도 확인)
- [ ] **모바일 청첩장 파싱** — 청첩장 URL 입력 → "불러오기" → parse-invitation Edge Function 호출 → 폼 자동 완성 확인 (기존 입력값 덮어쓰지 않는지도 확인)

---

### ~~네이티브 앱 QA~~ → 위 "실기기 검증 필요" 섹션으로 이동

---

## 완료 내역

### 2026-04-04 (웹 QA — SC-01~SC-12)

웹 브라우저 (`http://localhost:8081`) 기준 전체 시나리오 검증. 익명 Supabase 세션 사용.

**통과 (PASS)**
- [x] SC-01: 홈 화면 로드 — wediary 로고, 탭, 빈 상태 메시지, FAB 버튼
- [x] SC-02: 탭 전환 — "지난 결혼식" 탭 활성화, 빈 상태 📖 표시
- [x] SC-03: 새 결혼식 빈 폼 — 모든 필드, 버튼 렌더링 정상
- [x] SC-03 엣지케이스: 빈 이름 저장 → 에러 배너 "신랑 또는 신부 이름을 입력해주세요"
- [x] SC-03 엣지케이스: 내용 입력 후 취소 → dirty state 보호 작동 (페이지 유지)
- [x] SC-04: 결혼식 저장 → 홈 "예정" 탭에 카드 표시, D-Day 뱃지, 참석 뱃지, 캘린더 아이콘
- [x] SC-05: 상세 화면 — `<` / ✏️ / 🗑️ 헤더, 이름(Gaegu), 날짜+D-Day, 장소+복사, 참석 뱃지, 캘린더 버튼, 메모/축의금/저장
- [x] SC-05 참석 여부: 뱃지 탭 → 인라인 3-버튼 선택기 (참석/불참/미정/취소)
- [x] SC-06: 기억 저장 → 메모+축의금 입력 → "저장됨 ✓" 라임 피드백, 재진입 시 값 유지
- [x] SC-07: 설정 화면 — `<` 뒤로, 계정, 개인정보처리방침 `›`, 로그아웃, v1.0.0
- [x] SC-08: 로그아웃 모달 — "정말 로그아웃할까요?", 취소 시 모달 닫힘 설정 유지
- [x] SC-09: 개인정보처리방침 — `<` 뒤로, 섹션 1~4 렌더링
- [x] SC-10: 로그인 화면 — wediary 로고, 카카오 버튼, 테스트 버튼 (개발 모드)
- [x] SC-11: 편집 폼 — ✏️ 클릭 시 `/new?id=...` 로 이동, 기존 데이터 pre-populate 정상
- [x] SC-12: URL 파싱 플로우 — 불러오기 버튼 활성/비활성, 크래시 없음

**발견 및 수정 (FIXED)**
- [x] **ISSUE-001** `index.tsx` — WeddingCard `button > button` HTML 중첩 오류 → 외부 카드 `accessibilityRole="button"` 제거 (commit: 08d8cf8)
- [x] **ISSUE-001 후속** `index.tsx` — 린터가 `ATTENDANCE_PILL_BG/TEXT` import 제거 → 재추가 (commit: 8f1bf4e)

**미검증 (웹 불가, 네이티브 필요)**
- SC-13: OCR 갤러리 스캔
- SC-14: 캘린더 자동 추가

---

### 2026-04-04 (UX 피드백 반영)

- [x] `index.tsx` — 카드 목록에서 시간 표시 개선 (`text-white/40 text-xs` → `text-white/50 text-sm`, 날짜와 동일 스타일)
- [x] `index.tsx` — 참석 칩 제거, 카드 border 색으로 참석 여부 표시 (참석=연두, 불참=빨강, 미정=기본) + `ATTENDANCE_BORDER` 상수 추가
- [x] `index.tsx` — 설정 버튼: "설정" 텍스트 → `settings-outline` 아이콘
- [x] `new.tsx` — 등록 취소 시 ConfirmModal 표시 (내용 있을 때), 스와이프 백은 기존 Alert 유지
- [x] `new.tsx` — 신랑/신부 라벨에 `*` 필수 표시, 저장 시 빈 필드에 빨간 border 하이라이트

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
