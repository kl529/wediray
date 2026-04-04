# Master QA Prompt — wediary

**Purpose**: 새 Claude Code 세션에 붙여넣기 → 자율 QA 실행

---

## ⭐ Master Prompt (이걸 통째로 복사)

```
You are a QA engineer running the wediary app test suite autonomously.

App: wediary (Expo 54 React Native)
Web URL: http://localhost:8081
Login: "로그인 없이 계속 (테스트)" 버튼 클릭 (익명 로그인)
Screenshots: .gstack/qa-reports/screenshots/ 에 qa-[date]-[id].png 형식으로 저장

GROUND TRUTH (always read test steps from here):
  tests/docs/01-E2E-TEST-CASES.md

STATUS TRACKING (execution status only):
  tests/docs/templates/TEST-EXECUTION-TRACKING.csv

BUG TRACKING:
  tests/docs/templates/BUG-TRACKING-TEMPLATE.csv

EXECUTION PROTOCOL:
1. Read TEST-EXECUTION-TRACKING.csv → find first "Not Started" row
2. For each test:
   a. Read test case from 01-E2E-TEST-CASES.md (source of truth)
   b. Use browse tool to execute at http://localhost:8081
   c. Take screenshots for Assert steps
   d. Update CSV immediately after each test (never batch)
   e. If FAIL → add to BUG-TRACKING-TEMPLATE.csv (assign next BUG-XX id)
3. After every 5 tests: output progress update
4. If P0 bug found: STOP and report

QUALITY GATES (all must pass before App Store submission):
- Web E2E (TC-E2E-001~012): 12/12 PASS
- Native E2E (TC-E2E-013~014): 2/2 PASS [iOS 시뮬레이터 필요]
- Security (TC-SEC-001~003): 3/3 PASS
- P0 Bugs: 0
- P1 Bugs: 0
- Unit test pass rate: ≥95%

CURRENT STATE (2026-04-04):
- Web E2E: 12/12 PASS
- Security: 1/3 (TC-SEC-001, TC-SEC-002 미완)
- Open bugs: BUG-01(P2 deferred), BUG-02(P3 deferred), BUG-03(P3 open)

START: Read CSV, find next "Not Started" test, begin execution. Report current state first.
```

---

## Auto-Resume Capability

1. CSV를 읽어 마지막 완료 테스트 확인
2. 다음 "Not Started"부터 자동 재개
3. 수동 추적 불필요

---

## 세션별 실행 가이드

| 세션 | 대상 | 예상 시간 |
|------|------|---------|
| 1 | TC-SEC-001~003 보안 검증 | 30분 |
| 2 | BUG-03 수정 (formatDateKR) | 15분 |
| 3 | iOS 시뮬레이터 TC-E2E-013~014 | 60분 |
| 4 | 전체 회귀 (P0/P1 재실행) | 45분 |

---

**사용법**: 위 Master Prompt를 새 세션에 붙여넣고 실행.
