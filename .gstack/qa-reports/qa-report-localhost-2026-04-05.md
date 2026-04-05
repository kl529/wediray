# QA Report — wediary (localhost:8081)
**Date:** 2026-04-05
**Branch:** main
**Scope:** 오늘 추가된 기능만 검증 (Toast UI / 자동저장 / 저장버튼 제거 / 캘린더 모달 버그)
**Platform:** Web (Expo dev server, http://localhost:8081)
**Tester:** /qa skill

---

## 기능 검증 결과

| # | 기능 | 상태 | 증거 |
|---|------|------|------|
| T-01 | 새 결혼식 등록 — "등록됐어요" toast | ✅ PASS | `test1-toast-visible.png` |
| T-02 | 캘린더 "건너뛰기" 후 홈 이동 — 경고 없음 | ✅ PASS | `test2-calendar-add.png` |
| T-03 | 캘린더 "추가" 후 홈 이동 — 경고 없음 | ✅ PASS | `test2-calendar-add.png` |
| T-04 | 상세 화면 저장 버튼 제거 확인 | ✅ PASS | `test3-detail-screen.png` |
| T-05 | 참석 여부 변경 — "참석 여부 업데이트됐어요" toast | ✅ PASS | `test4-attendance-toast.png` |
| T-06 | 축의금 프리셋 선택 — 1.5s debounce 후 자동 저장 toast | ✅ PASS | `test5-gift-autosave.png` |
| T-07 | 메모 입력 — 1.5s debounce 후 자동 저장 toast | ✅ PASS | `test5-memo-autosave.png` |

**전체 결과: 7/7 PASS — 버그 없음**

---

## 건강 점수

| 카테고리 | 점수 |
|----------|------|
| Functional | 10/10 |
| UX | 10/10 |
| Visual | 10/10 |
| **종합** | **10/10** |

---

## 세부 검증 내용

### T-01, T-02, T-03 — Toast + 캘린더 모달 버그 수정

**재현 시나리오:**
1. 홈 → "+" 버튼 → 신랑/신부 입력 → 저장
2. "캘린더에 추가할까요?" 모달 표시됨
3. "건너뛰기" 또는 "추가" 클릭

**이전 버그:** 저장 성공 후 캘린더 모달에서 버튼을 누르면 "저장하지 않은 변경사항이 있습니다" 경고 모달이 잘못 표시됨.

**수정 결과:** 경고 모달 없이 홈으로 직행. 하단에 "등록됐어요" 흰색 pill toast 표시 후 2.2초 뒤 사라짐.

**스크린샷:** `test1-toast-visible.png`, `test2-calendar-add.png`

---

### T-04 — 저장 버튼 제거

**확인:** 상세 화면(`[id].tsx`) 헤더 및 하단 어디에도 저장 버튼 없음. 축의금/메모 섹션에 "자동 저장" 라벨이 대신 표시됨.

**스크린샷:** `test3-detail-screen.png`

---

### T-05 — 참석 여부 toast

**확인:** 참석 탭 즉시 → Supabase 업데이트 완료 후 "참석 여부 업데이트됐어요" toast 표시. 참석 pill이 lime 테두리/텍스트로 활성화됨 (DESIGN.md 준수).

**스크린샷:** `test4-attendance-toast.png`

---

### T-06, T-07 — 자동 저장 (debounce)

**확인:**
- 축의금: "10만" 프리셋 클릭 후 1.5초 → "저장됐어요" toast. 금액 `100,000원` 표시 정상.
- 메모: 텍스트 입력 후 1.5초 → "저장됐어요" toast. 메모 내용 유지 확인.
- `useRef` 기반 최신값 추적으로 stale closure 없음.

**스크린샷:** `test5-gift-autosave.png`, `test5-memo-autosave.png`

---

## 콘솔 에러

```
[warning] "shadow*" style props are deprecated. Use "boxShadow".
[warning] props.pointerEvents is deprecated. Use style.pointerEvents
```

→ Expo/React Native 내부 경고. 기능에 무관. 무시 가능.

---

## PR Summary

> QA found 0 issues. All 7 feature checks passed (Toast UI, auto-save, save button removal, calendar modal bug). Health score: 10/10.
