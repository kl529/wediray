# QA Report — wediary (localhost:8081)
Date: 2026-04-02
Branch: main
Duration: ~15 min
Pages tested: home, 지난결혼식탭, 설정, 개인정보처리방침, 새결혼식폼
Screenshots: .gstack/qa-reports/screenshots/
Mode: Standard (web dev)

---

## Summary

| Severity | Found | Fixed | Deferred |
|----------|-------|-------|----------|
| Critical | 0 | 0 | 0 |
| High | 0 | 0 | 0 |
| Medium | 1 | 1 | 0 |
| Low | 1 | 0 | 1 |
| **Total** | **2** | **1** | **1** |

**Health Score: 94/100** (baseline from this session)

**PR Summary:** QA found 2 issues, fixed 1, health score 94/100.

---

## Issues

### ISSUE-001 — DEV 버튼이 설정 화면에 노출됨 [FIXED]
- **Severity:** Medium
- **Category:** UX / 프로덕션 품질
- **Page:** /settings
- **Screenshot:** screenshots/qa-settings.png
- **Repro:** 앱 실행 → 설정 → "📅 캘린더 연동 테스트 (DEV)" 버튼이 사용자에게 노출됨
- **Fix:** `__DEV__` 조건으로 감싸 프로덕션 빌드에서 숨김
- **Commit:** bd3e364
- **File:** `app/app/(app)/settings.tsx:52`
- **Fix Status:** best-effort (웹 dev 서버는 `__DEV__=true`라 로컬에선 계속 보임, 프로덕션 EAS 빌드에서 검증 필요)

**Before:** settings.tsx — 버튼이 조건 없이 렌더링
**After:** `{__DEV__ && <TouchableOpacity ...>}` 로 감싸짐

---

### ISSUE-002 — 저장 실패 시 에러 배너가 스크롤 위에 숨겨짐 [DEFERRED]
- **Severity:** Low
- **Category:** UX
- **Page:** /new
- **Screenshot:** screenshots/qa-current-state.png
- **Repro:** 새 결혼식 폼 → 아래로 스크롤하여 입력 → 저장 실패 → 에러 배너("저장 실패: ...")가 ScrollView 최상단에 렌더링되지만 스크롤 위치가 리셋 안 됨
- **Fix (deferred):** ScrollView ref 추가 후 에러 발생 시 `scrollTo({ y: 0 })` 호출
- **Affected:** `app/app/(app)/new.tsx` ScrollView

---

## Console Health
- Error count: 0
- Warnings: 1 (React Native: `props.pointerEvents is deprecated. Use style.pointerEvents`) — 저위험, React Native Web 내부 경고

---

## Top 3 Things to Fix
1. ~~ISSUE-001: DEV 버튼 — FIXED~~ bd3e364
2. ISSUE-002: 에러 배너 스크롤 — deferred (low)
3. **참고:** 웹 버전은 Supabase 인증 없이 실행되므로 저장은 "로그인이 필요합니다" 에러가 예상됨. 실제 기능 테스트는 iOS 에뮬레이터/디바이스에서 수행 필요.

---

## Pages Tested
| Page | Status | Console Errors | Notes |
|------|--------|---------------|-------|
| / (홈, 예정탭) | ✅ | 0 | Empty state 정상 |
| / (지난결혼식탭) | ✅ | 0 | Empty state 정상 |
| /settings | ⚠️ FIXED | 0 | DEV 버튼 수정 |
| /privacy | ✅ | 0 | 내용 정상 |
| /new (폼) | ⚠️ | 1 warning | 유효성검사 정상, 에러배너 스크롤 이슈 |

---

## Health Score Breakdown
| Category | Weight | Score | Contribution |
|----------|--------|-------|-------------|
| Console | 15% | 90 | 13.5 |
| Links | 10% | 100 | 10.0 |
| Visual | 10% | 100 | 10.0 |
| Functional | 20% | 92 | 18.4 |
| UX | 15% | 93 | 14.0 |
| Performance | 10% | 100 | 10.0 |
| Content | 5% | 100 | 5.0 |
| Accessibility | 15% | 90 | 13.5 |
| **Total** | | | **94.4** |
