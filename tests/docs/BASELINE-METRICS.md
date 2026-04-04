# Baseline Metrics — wediary

**Date**: 2026-04-04
**Version**: v1.0.0 (pre App Store submission)
**Purpose**: Pre-QA snapshot. Compare test results against this to track regression.

---

## 1. Test Coverage (Current State)

### Unit Tests (Jest)
- **Total Tests**: 112
- **Passing**: 106 (94.6%)
- **Failing**: 6 (all in `db.test.ts` — `formatDateKR` returning day-of-week suffix)
- **Coverage**: 0% (Jest coverage not configured for React Native/Expo)

#### Test files
| File | Tests | Status |
|------|-------|--------|
| `ocr.test.ts` | 31 | ✅ All pass |
| `constants.test.ts` | 22 | ✅ All pass |
| `calendar.test.ts` | 17 | ✅ All pass |
| `brand.test.ts` | 9 | ✅ All pass |
| `wedding-create-list.test.ts` | 10 | ✅ All pass |
| `db.test.ts` | 23 | ❌ 6 failing (formatDateKR) |

### Integration Tests
- **Total Tests**: 0
- **Status**: Not implemented

### E2E Tests (Manual — `.gstack/test-scenarios.md`)
- **Total Scenarios**: 14 (SC-01 to SC-14)
- **Web tested**: SC-01~SC-12 (SC-13/14: native only)
- **iOS/Android tested**: SC-13, SC-14 (pending)

---

## 2. Known Issues (Pre-QA)

### Active Bugs
| ID | Severity | Description | File | Status |
|----|----------|-------------|------|--------|
| BUG-01 | P2 | URL 파싱 실패 시 Alert 미표시 (Supabase Edge Function 401) | `new.tsx` | Deferred |
| BUG-02 | P3 | DB의 `"attended"` 값 앱 미인식 (앱 허용값: `"attend"`) | `db.ts` | Deferred |
| BUG-03 | P3 | `formatDateKR()` 요일 suffix 포함 (테스트 기대값 불일치) | `db.ts` | Open |

### Technical Debt
- [ ] NativeWind 동적 클래스 import ESLint 자동 제거 (DEV-01)
- [ ] Jest coverage 미설정 (React Native 환경 커버리지 수집 필요)
- [ ] Apple Sign-In 미구현 (v2 예정)
- [ ] 6개 TypeScript 컴파일 에러

---

## 3. Security Status

### OWASP Top 10 Coverage

| ID | Threat | Status | Implementation |
|----|--------|--------|----------------|
| A01 | Broken Access Control | ✅ Mitigated | Supabase RLS — user_id 소유권 검증 |
| A02 | Cryptographic Failures | ✅ Mitigated | Supabase Auth JWT, PKCE flow, AsyncStorage 세션 |
| A03 | Injection | ✅ Mitigated | Supabase SDK 파라미터 바인딩, Edge Function 입력 검증 |
| A04 | Insecure Design | ⚠️ Partial | Rate limiting 없음; MVP 스케일에서 수용 가능 |
| A05 | Security Misconfiguration | ✅ Mitigated | Anon key만 클라이언트 노출, service_role은 Edge Function 내부만 |
| A06 | Vulnerable Components | ⚠️ Unknown | npm audit 미실행 |
| A07 | Authentication Failures | ✅ Mitigated | Supabase PKCE OAuth, 세션 만료 자동 갱신 |
| A08 | Data Integrity Failures | ✅ Mitigated | Supabase RLS, 입력 유효성 검사 (신랑/신부 필수) |
| A09 | Logging Failures | ⚠️ Partial | 서버 로깅 없음; Supabase Dashboard에서 확인 가능 |
| A10 | SSRF | ✅ Mitigated | Edge Function: https://만 허용, private IP 차단 |

**Current Coverage**: 6/10 mitigated, 3/10 partial, 1/10 unknown = ~70%

---

## 4. Performance Metrics

- **App bundle size**: Not measured (EAS build pending)
- **Web first load**: ~2-3s (Expo web dev server, not optimized)
- **DB query (getWeddings)**: <200ms (Supabase free tier, <50 rows)
- **Edge Function (parse-invitation)**: 1-5s (cold start) / 500ms-2s (warm)

---

## 5. Code Quality

- **TypeScript errors**: 6 (non-blocking for build)
- **TypeScript strict mode**: No (`strict: false` in tsconfig)
- **ESLint errors**: 0 (NativeWind dynamic class false-positive는 workaround 완료)
- **Console errors (Web)**: 2 known non-blocking (DateTimePicker, pointerEvents deprecation)

---

## 6. Predicted Issues

**PREDICTED-001**: Kakao 로그인 실패 에러 → 이미 수정됨 (2026-04-04)
- **Root Cause**: `console.error` → 유저 피드백 없음
- **Fix**: `Alert.alert('로그인 실패', error.message)` 추가

**PREDICTED-002**: 결혼식 삭제 시 Storage 사진 파일 잔존 → 이미 수정됨
- **Root Cause**: `deleteWedding()`이 `deleteWeddingPhotos()` 미호출
- **Fix**: `deleteWeddingPhotos(id)` 호출 추가

---

## 7. Quality Gates Status (Pre-QA)

| Gate | Target | Current | Status |
|------|--------|---------|--------|
| Unit Test Execution | 100% | 100% | ✅ |
| Unit Test Pass Rate | ≥80% | 94.6% | ✅ |
| E2E Scenarios (Web) | SC-01~12 | 12/12 | ✅ |
| E2E Scenarios (Native) | SC-13~14 | 0/2 | ❌ Pending |
| P0 Bugs | 0 | 0 | ✅ |
| P1 Bugs | 0 | 0 | ✅ |
| P2 Bugs | ≤3 | 1 open | ✅ |
| OWASP Coverage | ≥70% | ~70% | ✅ |
| TypeScript errors | 0 | 6 | ❌ |

**Overall Gate**: CONDITIONAL PASS — native E2E (SC-13/14) + TS errors 해소 후 제출 가능.

---

**Next Steps**: SC-13/14 iOS 실기기 테스트 → TS 에러 수정 → `eas submit`
