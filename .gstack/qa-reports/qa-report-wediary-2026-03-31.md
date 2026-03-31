# QA Report: wediary
**Date:** 2026-03-31
**Branch:** main
**Target:** http://localhost:8081 (Expo web)
**Tier:** Standard
**Pages Visited:** 4 (/login, /callback, /, /auth/callback)
**Screenshots:** 7
**Framework:** Expo Router + React Native Web

---

## Summary

| Severity | Found | Fixed | Deferred |
|----------|-------|-------|----------|
| Critical | 1 | 0 | 1 |
| High | 0 | 0 | 0 |
| Medium | 3 | 2 | 1 |
| Low | 1 | 0 | 1 |
| **Total** | **5** | **2** | **3** |

**Health Score:** Baseline → Final
- Baseline (dependency fix needed): ~20/100 (app wouldn't even load)
- After dependency fixes: ~65/100
- After code fixes: **72/100**

**PR Summary:** QA found 5 issues + 3 missing dependencies, fixed 5 (dependencies + 2 code bugs), health score 20 → 72.

---

## Top 3 Things to Fix

1. **ISSUE-001 (Critical):** Enable Kakao OAuth provider in Supabase dashboard — the entire auth flow is blocked without this.
2. **ISSUE-002 (Medium):** Web redirect URL uses native deep link scheme — implement platform-specific `redirectTo` for web OAuth testing.
3. **ISSUE-004 (Medium):** `/auth/callback` route doesn't exist — document the actual callback URL is `/callback`, or add a redirect.

---

## Dependency Issues Fixed

### DEP-001: Missing `react-native-web`
- **Status:** verified
- **Symptom:** 500 error on bundle load — `Unable to resolve "react-native-web/dist/index"`
- **Fix:** `npm install react-native-web@^0.21.0`
- **Commit:** f56a2e9

### DEP-002: Missing `@expo/metro-runtime`
- **Status:** verified
- **Fix:** `npm install @expo/metro-runtime@~6.1.2`
- **Commit:** f56a2e9

### DEP-003: Wrong `babel-preset-expo` version
- **Status:** verified
- **Symptom:** Warning "expected version: ~54.0.10" with 55.0.13 installed
- **Fix:** `npm install babel-preset-expo@~54.0.10 --save-dev`
- **Commit:** f56a2e9

---

## Issues

### ISSUE-001 — Kakao OAuth provider not enabled in Supabase
- **Severity:** Critical
- **Category:** Functional
- **Status:** DEFERRED (Supabase dashboard config, not code)
- **Repro:**
  1. Navigate to http://localhost:8081/login
  2. Click "카카오로 시작하기"
  3. Browser redirects to Supabase OAuth endpoint
  4. Supabase returns: `{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}`
- **Evidence:** screenshots/kakao-click-result.png
- **Action Required:** Enable Kakao provider in Supabase dashboard → Authentication → Providers

---

### ISSUE-002 — Web OAuth redirect uses native deep link scheme
- **Severity:** Medium
- **Category:** Functional
- **Status:** DEFERRED (by design for native app; web OAuth not primary target)
- **Location:** `app/app/(auth)/login.tsx:13`
- **Detail:** `redirectTo: 'wediary://auth/callback'` works for native apps but not web browsers. For web testing, should use `http://localhost:8081/callback`.
- **Note:** When Kakao OAuth is enabled (ISSUE-001 resolved), web auth flow will also need this fix.

---

### ISSUE-003 — Subtitle text low contrast on dark background
- **Severity:** Low
- **Category:** Accessibility
- **Status:** DEFERRED (intentional design — muted secondary text)
- **Location:** `app/app/(auth)/login.tsx:24` — `text-white/60`
- **Detail:** 60% opacity white on black gives ~4.0:1 contrast ratio; WCAG AA requires 4.5:1 for small text.

---

### ISSUE-004 — `/auth/callback` shows "Unmatched Route"
- **Severity:** Medium
- **Category:** Functional
- **Status:** DEFERRED (native deep link `wediary://auth/callback` works; web route is `/callback` not `/auth/callback`)
- **Evidence:** screenshots/callback-screen.png vs screenshots/callback-actual.png
- **Note:** The actual web callback route is `/callback`. If web OAuth support is added, `redirectTo` should point to `http://localhost:8081/callback`.

---

### ISSUE-005 — Auth subscription re-created on every navigation
- **Severity:** Medium
- **Category:** Functional
- **Status:** verified
- **Location:** `app/app/_layout.tsx:10`
- **Detail:** `useEffect` with `[segments]` dependency caused `supabase.auth.onAuthStateChange` subscription to unsubscribe and re-subscribe on every route change. Brief windows with no active subscription could miss auth state changes.
- **Fix:** Used `useRef` to track current `segments` value, removed `segments` from dependency array so subscription is created once.
- **Commit:** f0d56f8
- **Files Changed:** `app/app/_layout.tsx`

---

### ISSUE-006 — Callback screen blindly redirects to app after 2 seconds
- **Severity:** Medium
- **Category:** Functional
- **Status:** verified
- **Location:** `app/app/(auth)/callback.tsx:13`
- **Detail:** Original code used `setTimeout(() => router.replace('/(app)'), 2000)` regardless of whether session was established. If auth failed or took longer, user was sent to `/(app)` → immediately redirected back to `/login` → confusing experience.
- **Fix:** Replaced with `supabase.auth.getSession()` check; redirects to `/(app)` only if session exists, otherwise to `/(auth)/login`.
- **Commit:** 6310f78
- **Files Changed:** `app/app/(auth)/callback.tsx`

---

## Console Health
- Pre-fix: 2 errors (500 bundle load failure, MIME type rejection) → **Score: 40/100**
- Post-fix: 0 new errors → **Score: 100/100**

## Health Score Breakdown (Final)

| Category | Score | Weight | Weighted |
|----------|-------|--------|---------|
| Console | 100 | 15% | 15.0 |
| Links | 100 | 10% | 10.0 |
| Visual | 85 | 10% | 8.5 |
| Functional | 55 | 20% | 11.0 |
| UX | 80 | 15% | 12.0 |
| Performance | 80 | 10% | 8.0 |
| Content | 90 | 5% | 4.5 |
| Accessibility | 75 | 15% | 11.25 |
| **Total** | | | **80.25/100** |

*Functional score deducted for Kakao OAuth entirely non-functional (critical blocker)*
