# Design Audit — wediary (localhost:8081)
**Date:** 2026-03-31  
**Branch:** main  
**Depth:** Standard (4 pages)  
**Design Score: B (85)**  
**AI Slop Score: A**

---

## First Impression

"The site communicates **intimacy and care** — dark background, hot pink accent, minimal chrome. Right emotional register for a wedding memory app."

"I notice **the desktop dead zones** — 430px container centered in gray flanks. The side margins are dead weight on desktop, but this is an iOS-first app so it's acceptable."

"First 3 things my eye goes to: **1) 'wediary' in pink**, **2) 예정 tab (active)**, **3) + FAB at bottom right**. Hierarchy is correct."

"One word: **intimate**."

---

## Design System (Extracted)

| Property | Value | Status |
|----------|-------|--------|
| Font | `ui-sans-serif, system-ui` (system stack) | Acceptable for iOS target |
| Background | `#000000` (pure black) | ✅ Consistent |
| Accent | `#f472b6` (pink-400) | ✅ BRAND_PINK constant |
| Overlay | `rgba(255,255,255,0.05-0.40)` | ✅ Scale |
| Border radius | `rounded-xl` / `rounded-2xl` | ✅ Consistent |
| Spacing | `p-4`, `px-6`, `gap-2/3` (8px base) | ✅ Systematic |
| Performance | 221ms total load | ✅ Excellent |

---

## Findings

### D-001 — callback.tsx `#FF69B4` → `BRAND_PINK` (Medium → Fixed ✅)
**Severity:** Medium  
**Category:** Color  
**Fix Status:** verified  
**Commit:** d91e56e

`callback.tsx:26` used the old hardcoded `#FF69B4` instead of the `BRAND_PINK` constant. FINDING-002 from the previous session fixed `[id].tsx` but missed this file.

**Fix:** Added `import { BRAND_PINK }` and used it in `ActivityIndicator color={BRAND_PINK}`.

---

### D-002 — Nav button touch targets 24px → 40px (Medium → Fixed ✅)
**Severity:** Medium  
**Category:** Interaction States  
**Fix Status:** verified  
**Commit:** f24d51d

"취소", "저장" (new.tsx), "← 뒤로" (settings.tsx) TouchableOpacity elements had no padding, resulting in 24px touch height on web.

**Before:** 28×24px  
**After:** 28×40px (40px height, approaching 44px target)

**Fix:** Added `className="py-2"` to all three nav button TouchableOpacity elements.

---

### D-003 — Motion: no screen transitions (Low, Deferred)
**Severity:** Low  
**Category:** Motion  

No transitions between screens. On native iOS, expo-router provides default transitions. On web, navigation is instant. Not a blocker for MVP.

---

## Per-Category Grades

| Category | Grade | Notes |
|----------|-------|-------|
| Visual Hierarchy | B | Clear focal points, intentional empty states |
| Typography | C | System fonts only — beautiful on iOS, neutral on web |
| Spacing | A | Systematic 8px base throughout |
| Color | A | BRAND_PINK consistent (after D-001 fix) |
| Interaction States | B | active:opacity-70, pink highlights, focus states |
| Responsive | A | 430px max-width, mobile-first, black body background |
| Content | A | Korean copy clear, warm empty states |
| AI Slop | A | No gradient blobs, no feature grids, specific copy |
| Motion | C | No web transitions (native transitions exist) |
| Performance | A | 221ms total load |

**Design Score: B (85)**  
**AI Slop Score: A** — The aesthetic is clean and specific. No generic SaaS patterns.

---

## AI Slop Checklist

| Pattern | Present? |
|---------|----------|
| Purple/indigo gradient | ✅ No |
| 3-column icon feature grid | ✅ No |
| Icons in colored circles | ✅ No |
| Centered everything | ✅ No (left-aligned content) |
| Uniform bubbly radius | ✅ No (xl/2xl, consistent not excessive) |
| Decorative blobs/waves | ✅ No |
| Emoji as design elements | ⚠️ Border — empty state emojis (acceptable for app) |
| Colored left-border cards | ✅ No |
| Generic hero copy | ✅ No |
| Cookie-cutter sections | ✅ No |

---

## Summary

| | Before | After |
|-|--------|-------|
| Findings | 3 | 3 |
| Fixed | 0 | 2 |
| Deferred | 0 | 1 |
| Design Score | B (82) | B (85) |
| AI Slop Score | A | A |

**PR Summary:**
> Design review found 3 issues, fixed 2. Design score B→B (82→85), AI Slop A. No regressions.

