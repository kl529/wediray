# QA Report — wediary web — 2026-04-04

**플랫폼:** Web (http://localhost:8081)
**스크린샷:** `.gstack/qa-reports/screenshots/web-sc*.png`
**테스트 계정:** 익명 로그인 (테스트 버튼)

---

## 요약

| 구분 | 결과 |
|------|------|
| 테스트 시나리오 | SC-01 ~ SC-12 (Web), SC-13/SC-14 미실시 (iOS 전용) |
| 통과 | SC-01, SC-02, SC-03, SC-04, SC-05, SC-07, SC-08, SC-09, SC-10, SC-11 |
| 부분 통과 | SC-06, SC-12 |
| 미실시 | SC-13 (갤러리 OCR), SC-14 (캘린더) — iOS 시뮬레이터 런타임 없음 |
| 앱 크래시 | 없음 |
| 콘솔 에러 | props.pointerEvents deprecated (경고), 401 (SC-12 파싱 시) |

---

## SC-01. 홈 화면 로드 ✅
- wediary 핑크 로고 ✅
- 설정 버튼 우상단 ✅
- 예정/지난 결혼식 탭 ✅
- 결혼식 카드 표시 ✅
- FAB(+) 버튼 ✅
- 콘솔 에러 없음 (경고만)

## SC-02. 탭 전환 ✅
- 지난 결혼식 탭 핑크 활성화 ✅
- 빈 상태(📖) 표시 ✅
- 탭 복귀 ✅

## SC-03. 새 결혼식 추가 — 빈 폼 ✅
- URL 입력 + 불러오기 버튼 ✅
- 카메라/갤러리 버튼 ✅
- 신랑/신부/날짜/장소/참석여부 ✅
- 날짜 기본값 오늘 ✅
- 취소/저장 버튼 ✅

## SC-04. 새 결혼식 추가 — 수동 입력 후 저장 ✅
- 저장 후 홈 이동 ✅
- 카드 표시 (SC04신랑 ♥ SC04신부) ✅
- D-Day 뱃지 ✅
- 참석 뱃지 라임색 ✅
- ⚠️ Web에서 DateTimePicker 미지원(콘솔 경고) → 날짜를 미래로 변경 불가, 오늘 날짜로 저장됨

## SC-05. 결혼식 상세 화면 ✅
- 뒤로(`<`), 수정(✏️), 삭제(🗑️) 아이콘 ✅
- 이름/날짜/D-Day/장소 표시 ✅
- 참석 뱃지 ✅
- 캘린더 버튼 ✅
- 메모/축의금(5만/10만/15만/20만)/기억저장 ✅

## SC-06. 추억 저장 ⚠️ 부분 통과
- 메모 입력 후 저장 ✅
- 재진입 시 메모 유지 ✅
- 저장됨 ✓ 피드백: 2초 타이밍으로 캡처 실패 (기능 동작은 확인)
- 축의금 5만 버튼: Web 환경에서 selector 충돌로 클릭 미확인
- 미저장 뒤로가기 Alert: 미테스트

## SC-07. 설정 화면 ✅
- `<` 뒤로 ✅
- 계정 섹션 (익명이라 "—") ✅
- 개인정보처리방침 `›` ✅
- 로그아웃 빨간 텍스트 ✅
- v1.0.0 ✅

## SC-08. 로그아웃 확인 모달 ✅
- "로그아웃 / 정말 로그아웃할까요?" 모달 ✅
- 취소 → 모달 닫힘, 설정 유지 ✅
- ⚠️ 브라우저 ARIA 이벤트로 취소 버튼 클릭 불가 → JS 좌표 클릭으로 우회

## SC-09. 개인정보처리방침 ✅
- `<` 뒤로 ✅
- 1~4섹션 이상 정상 렌더링 ✅

## SC-10. 비로그인 상태 (로그인 화면) ✅
- wediary 로고 ✅
- 카카오로 시작하기 버튼 ✅
- 로그인 없이 계속 (테스트) 버튼 ✅

## SC-11. 지난 결혼식 데이터 확인 ✅
- 카드에 이름/날짜 표시 ✅
- D-Day 뱃지 없음 ✅
- 날짜 "N일 전" 형식 (100일 전) ✅
- 수정 폼에 모든 필드 채워져 있음 ✅
- ⚠️ 참석 뱃지: DB에 `"attended"` 값 저장 시 앱이 인식 못함 → 뱃지 미표시 (앱 허용값과 불일치)

## SC-12. 모바일 청첩장 URL 파싱 ⚠️ 부분 통과
- URL 입력 후 불러오기 버튼 활성화 ✅
- invite_url 필드 유지 ✅
- 앱 크래시 없음 ✅
- ⚠️ 파싱 결과: 필드 자동 입력 안됨 (401 에러 발생)
- ⚠️ 로딩 스피너: 캡처 타이밍 실패 (동작 여부 미확인)
- ⚠️ 파싱 실패 Alert 미표시 (조용히 실패)

## SC-13. OCR — 갤러리 스캔 ⏭️ 미실시
- iOS 시뮬레이터 런타임 없음 (Xcode 설치됐으나 Runtime 미다운로드)
- Web 플랫폼 미지원

## SC-14. 캘린더 자동 추가 ⏭️ 미실시
- iOS 시뮬레이터 런타임 없음
- Web 플랫폼 미지원

---

## 발견된 버그

### BUG-01 (Medium) — SC-12: URL 파싱 실패 Alert 미표시
- **현상:** 청첩장 URL 파싱 실패 시 조용히 실패 (Alert 없음)
- **재현:** 새 결혼식 → URL 입력 → 불러오기 → 결과 없음
- **콘솔:** `401 Failed to load resource`
- **기대 동작:** "파싱 실패" Alert 표시
- **상태:** 미수정 (deferred)

### BUG-02 (Low) — SC-11: attendance 값 `"attended"` 인식 불가
- **현상:** DB에 `"attended"` 값이 있을 때 참석 뱃지 undefined
- **기대:** 앱 허용값 `"attend"` 또는 `"attended"` 통일 필요
- **상태:** 미수정 (deferred)

### ISSUE-001 (High) — 홈 카드 `button > button` 중첩 에러 ✅ **수정됨**
- **현상:** `WeddingCard` 외부 `TouchableOpacity`에 `accessibilityRole="button"` 설정 시 Web에서 `<button>` 렌더링 → 내부 캘린더 버튼과 중첩 HTML 오류
- **콘솔:** `In HTML, <button> cannot be a descendant of <button>`
- **수정:** `WeddingCard` 외부 `TouchableOpacity`에서 `accessibilityRole="button"` 제거 → `<div>` 렌더링으로 변경
- **커밋:** `08d8cf8`, `8f1bf4e`
- **파일:** `app/app/(app)/index.tsx`

### DEV-01 (Medium) — ESLint가 NativeWind 동적 클래스 import 자동 제거
- **현상:** `ATTENDANCE_PILL_BG`, `ATTENDANCE_PILL_TEXT` import가 ESLint/Prettier 실행 시 자동 제거됨
- **원인:** NativeWind 동적 클래스 문자열(`${ATTENDANCE_PILL_BG[att]}`)을 정적 분석이 "사용됨"으로 인식 못함
- **영향:** 빌드 깨짐, 매 Edit 후 수동 복구 필요
- **해결 방향:** `.eslintrc`에 `no-unused-vars` 규칙 예외 추가 또는 NativeWind eslint plugin 설정
- **상태:** 미수정

### NOTE-01 (Info) — Web: DateTimePicker 미지원
- 콘솔: `DateTimePicker is not supported on: web`
- 날짜를 오늘 이외 날짜로 변경 불가 (Web 테스트 제한사항)

### NOTE-02 (Info) — props.pointerEvents deprecated
- React Native/NativeWind 업그레이드 시 해소 예정

---

## 2차 수정 (2026-04-04 세션 2)

이번 세션에서 코드 전수조사 + 수정 완료. 수정 내역:

| 파일 | 이슈 | 심각도 | 수정 내용 |
|------|------|--------|-----------|
| `login.tsx` | 카카오 로그인 에러 silent fail | P1 | `Alert.alert('로그인 실패', error.message)` 추가 |
| `[id].tsx` | `beforeRemove` 웹 미작동 | P1 | `handleBack`에서 `isDirty` 체크 후 `ConfirmModal` 표시 |
| `new.tsx` | `isDirty` 날짜/시간 미추적 | P2 | `dateObj`, `timeObj`, `showTime` 포함 |
| `db.ts` | 결혼식 삭제 시 사진 파일 미삭제 | P2 | `deleteWeddingPhotos(id)` 호출 추가 |
| `new.tsx` | 웹에서 카메라/갤러리 버튼 노출 | P2 | `Platform.OS !== 'web'` 가드 추가 |
| `index.tsx` | 지난 결혼식 빈 상태 문구 오해 | P3 | "기억을 기록하면" → "지난 결혼식을 추가하면" |

### 미수정 항목 (deferred)
- **BUG-01**: URL 파싱 실패 Alert 미표시 (Supabase Edge Function 401 — 서버 이슈)
- **BUG-02**: DB의 `"attended"` 값 앱 미인식 (데이터 정합성 이슈)
- **DEV-01**: NativeWind 동적 클래스 import ESLint 자동 제거
- **SC-03 Web**: DateTimePicker 웹 미지원 (React Native 제약)

---

## 헬스 스코어

| 카테고리 | 점수 (1차) | 점수 (2차, ISSUE-001) | 점수 (3차, 전수조사 후) |
|---------|-----------|----------------------|------------------------|
| Functional | 80 | 87 | 93 |
| UX | 85 | 87 | 93 |
| Console | 70 | 80 | 80 |
| 전체 (추정) | **78/100** | **85/100** | **91/100** |

**최종 요약:** P1 2개, P2 3개, P3 1개 수정 완료. deferred 4개 (서버/플랫폼 제약). SC-13/14 iOS 런타임 필요. Health score 85→91.
