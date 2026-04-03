# wediary TODOs

---

## 다음 세션 작업

### 네이티브 앱 QA (iOS 시뮬레이터 or 실기기)

웹 테스트 로그인(`router.replace('/(app)')`)이 Supabase 세션을 생성하지 않아서,
웹 브라우저에서는 데이터 화면 테스트가 불가능합니다.
아래 기능들은 실제 로그인된 네이티브 앱에서 직접 확인 필요:

- [ ] **[id].tsx 신규 기능 전체** — 실기기 or 시뮬레이터 + 카카오 로그인 후 확인
  - 축의금 입력 시 숫자 포맷팅 (100000 → raw 입력, 하단 미리보기 100,000원)
  - 참석여부 배지 탭 → 인라인 선택기 → 즉시 저장
  - 기억 수정 후 뒤로 누르면 "나가기" 경고 Alert
  - 상세 화면 헤더 중앙에 이름 표시 (스크롤 시에도)
  - 사진 추가 버튼 → 카메라/갤러리 Alert
- [ ] **홈 화면** — 결혼식 목록 로딩, 예정/지난 탭 전환, 지난 탭 날짜 역순
- [ ] **결혼식 삭제** — photos + memories DB 레코드까지 삭제되는지 확인

### 웹 테스트 로그인 개선 (선택)

웹 QA를 제대로 하려면 테스트 로그인이 실제 Supabase 익명 세션을 만들어야 함.
`supabase.auth.signInAnonymously()` 사용 or 테스트 계정 하드코딩 고려.

---

## 완료 내역

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
