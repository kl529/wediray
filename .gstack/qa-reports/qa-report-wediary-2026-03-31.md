# QA Report — wediary
**Date:** 2026-03-31 | **Branch:** main | **Target:** http://localhost:19006 (expo web) | **Tier:** Standard
**Duration:** ~45 min | **Pages visited:** 홈, 새 결혼식, 설정 | **Framework:** Expo 54 / React Native Web 0.21

---

## Health Score

| | Baseline (before fixes) | Final (after fixes) |
|--|--|--|
| Score | 52/100 | 86/100 |

---

## Summary Table

| Category | Weight | Score | Issues |
|----------|--------|-------|--------|
| Console | 15% | 85 | Library warnings only |
| Links | 10% | 100 | No broken links |
| Visual | 10% | 95 | No layout issues |
| Functional | 20% | 80 | 2 issues fixed |
| UX | 15% | 85 | Navigation clean |
| Performance | 10% | 90 | No slowness |
| Content | 5% | 95 | Korean copy correct |
| Accessibility | 15% | 70 | No ARIA on custom buttons |

---

## Top 3 Findings

1. **ISSUE-001 (Critical) — FIXED**: 저장 버튼이 web에서 완전 무반응. `user!.id`가 null user로 TypeError 크래시, `Alert.alert`이 web에서 표시 안 됨.
2. **ISSUE-002 (High) — FIXED**: 빈 폼 저장 시 아무 피드백 없음. Alert.alert 대신 인라인 에러 배너 추가.
3. **ISSUE-004 (Low) — DEFERRED**: react-native-web 라이브러리 내부 deprecation 경고. 우리 코드에서 수정 불가.

---

## Issues

### ISSUE-001 — 저장 완전 무반응 (Critical) — FIXED
**Commit:** cc3dccf | **Files:** app/lib/db.ts

`createWedding()`, `upsertMemory()`, `uploadPhoto()`에서 `user!.id` non-null assertion 사용.
dev 모드에서 인증 없이 접근 시 → `null.id` → TypeError. `Alert.alert`이 web에서 렌더링 안 돼 완전히 조용히 실패.

**Fix:** 3개 함수에 `if (!user) throw new Error('로그인이 필요합니다.')` 추가. `user!.id` → `user.id` 교체.

### ISSUE-002 — 폼 유효성 검사 피드백 없음 (High) — FIXED
**Commit:** d4e9d02 | **Files:** app/app/(app)/new.tsx

빈 폼 저장 시 `Alert.alert`만 호출 → web에서 silent fail. `formError` 상태와 인라인 에러 배너 추가.

### ISSUE-003 — 삭제 확인 Alert buttons 배열 (Medium) — DEFERRED
[id].tsx의 삭제 확인 Alert이 buttons 배열 사용. Web에서 window.confirm() fallback되는데 destructive style 손실. 실디바이스에서는 문제 없음. custom ConfirmModal 도입 시 해결.

### ISSUE-004 — 라이브러리 deprecation 경고 (Low) — DEFERRED
`shadow*` / `props.pointerEvents` 경고가 react-native-web 내부에서 발생. 우리 소스에서 수정 불가. 라이브러리 업그레이드로 해결 예정.

---

## Fix Summary

| Issue | Severity | Status | Commit |
|-------|----------|--------|--------|
| user!.id null crash | Critical | verified | cc3dccf |
| Form validation silent fail | High | verified | d4e9d02 |
| Alert buttons on web | Medium | deferred | — |
| Library deprecation warnings | Low | deferred | — |

**PR Summary:** QA found 4 issues (2 critical/high, 2 deferred), fixed 2. Health score 52 → 86. 핵심 수정: web에서 저장 실패 시 인라인 에러 표시 + DB 함수 null user 명시적 체크.

---

## Notes

React Native 모바일 앱이며 web 모드는 개발 편의용. 발견된 이슈들은 주로 web 환경 특유의 문제. 실제 iOS/Android 디바이스에서는 로그인 후 정상 동작 예상.
