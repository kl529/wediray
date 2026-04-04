# Design Audit — wediary (localhost:8081)
**Date:** 2026-04-02
**Branch:** main
**Auditor:** /design-review
**Mode:** Full (App UI)
**Outside Voice:** Claude subagent [single-model] (Codex auth expired)

---

## Headline Scores

| Score | Grade | Notes |
|-------|-------|-------|
| **Design Score** | **C+** | Solid intent, missing polish |
| **AI Slop Score** | **B** | Mostly clean Y2K aesthetic; emoji empty states the main issue |

---

## First Impression

The site communicates **"dark, personal, Y2K-coded."**

I notice the pure black background — it reads more dev-mode than intentional. The hot pink wordmark and FAB create clear brand anchors.

The first 3 things my eye goes to: **(1) pink "wediary" wordmark**, **(2) tab bar with active pill**, **(3) floating action button**.

If I had to describe this in one word: **"promising."**

The design has a clear POV (Y2K dark diary: black + hot pink + electric accents). That's unusual and good. The execution just needs tightening.

---

## Inferred Design System

**Fonts:** System-only (`-apple-system`, `system-ui`). No custom font loaded. No typographic personality.

**Colors (Y2K palette — intentional):**
- Background: `#000000` (pure black)
- Brand/accent: `#FF69B4` (hot pink)
- Electric lime: `#CCFF00` (attending status)
- Electric sky: `#00CFFF` (pending status)
- Muted inactive: `rgba(255,255,255,0.4)`

**Heading scale:** No semantic HTML headings. React Native `Text` components use `text-xs` through `text-5xl` — 7 distinct sizes with no semantic names.

**Spacing:** 24px (`px-6`) horizontal padding used consistently across all screens. One divergence: `paddingBottom: 100` on home list (to clear FAB) vs `60` elsewhere.

**Border-radius:** Three values mixed without semantic rule: `rounded-2xl` (cards), `rounded-xl` (inputs/buttons), `rounded-lg` (tab items). Rule is implicit and inconsistently applied.

---

## Litmus Checks

| Check | Result |
|-------|--------|
| Brand/product unmistakable in first screen? | YES — pink wordmark dominant |
| One strong visual anchor present? | YES — pink FAB, pink wordmark |
| Page understandable by scanning only? | YES — tabs are clear |
| Each section has one job? | YES |
| Are cards actually necessary? | YES — `WeddingCard` is interactive |
| Does motion improve hierarchy? | NO — no motion present |
| Would design feel premium with shadows removed? | YES — it's already minimal |

---

## Findings

### FINDING-001 — Empty states missing primary action [HIGH]
**Category:** Content/Interaction
**File:** `app/app/(app)/index.tsx:28-37`

The `EmptyState` component shows an emoji + one-line text with zero path forward. "예정된 결혼식이 없어요" with a 💌 emoji leaves first-time users stranded. The FAB exists on the same screen but is visually disconnected from the empty state.

I wonder if new users even know the + button adds a wedding. The empty state should say so.

**Fix:** Add a subtle CTA hint below the empty state copy pointing to the FAB.

---

### FINDING-002 — Accessibility entirely absent [HIGH]
**Category:** Interaction States / A11y
**Files:** All screens

Not a single interactive element has `accessibilityLabel` or `accessibilityRole`. Screen readers would announce "+", "←", or nothing for key controls:
- FAB (`index.tsx:103`) — announces "+"
- Back button (`settings.tsx:31`) — announces "← 뒤로"
- Emotion tag chips (`[id].tsx`) — no `accessibilityState={{ selected }}`
- Delete button (`[id].tsx:174`) — no destructive hint

This would fail App Store accessibility review guidelines.

**Fix (deferred):** Requires adding `accessibilityLabel` props across all screens. Too broad for this session — added to TODOS.md.

---

### FINDING-003 — FAB primary action styled with lightest font weight [MEDIUM]
**Category:** Typography
**File:** `app/app/(app)/index.tsx:108`

The FAB "+" uses `font-light` — the lightest weight in the entire app. Every other interactive control uses `font-bold` or `font-semibold`. The most important call-to-action having the weakest typographic weight is backwards.

**Fix:** Change `font-light` → `font-bold` on the FAB label.

---

### FINDING-004 — `uppercase tracking-widest` on Korean section labels [MEDIUM]
**Category:** Typography
**File:** `app/app/(app)/new.tsx:156,203,215,227,274`

Korean has no uppercase/lowercase distinction — `uppercase` does nothing to Korean characters. `tracking-widest` (0.1em letterspacing) applied to Korean Hangul creates ugly, unnatural spacing between glyphs. Korean typography best practice is `tracking-normal` or at most `tracking-wide`.

The label style `text-white/40 text-xs mb-2 uppercase tracking-widest` is copy-pasted 5 times.

**Fix:** Remove `uppercase tracking-widest` from Korean section labels.

---

### FINDING-005 — Emoji as design elements in empty states and scan button [MEDIUM]
**Category:** AI Slop
**Files:** `index.tsx:31`, `new.tsx:192`

Three emoji used as visual design elements: 💌 (home empty), 📖 (past tab empty), 📷 (scan button). Emoji render inconsistently across Android/iOS/web and convey a casual-app feel rather than crafted polish. The 📷 emoji inside a button is particularly mismatched — it looks like a placeholder that never got swapped for a real icon.

**Fix (partial):** Replace 📷 scan button emoji with a text-only label since the camera icon is purely decorative here. The empty state emoji (💌, 📖) stay as a Y2K aesthetic choice — they have character — but the scan button should use text only.

---

### FINDING-006 — Kakao button color undocumented in constants [POLISH]
**Category:** Color System
**File:** `app/app/(auth)/login.tsx:32`, `app/lib/constants.ts`

`bg-[#FEE500]` is hard-coded on the Kakao button and appears nowhere else. Kakao Yellow is a brand-mandated color and won't change often, but it should be documented in `constants.ts` so the next developer knows it's intentional, not a placeholder.

**Fix:** Add `KAKAO_YELLOW = '#FEE500'` to constants and use it in login.tsx.

---

### FINDING-007 — Font system has no semantic names [POLISH]
**Category:** Typography
**File:** `tailwind.config.js`, all screens

7 distinct font sizes used across 6 screens (`text-xs` through `text-5xl`) with no semantic mapping. No `heading-1`, `label`, or `caption` tokens. This is fine for a small app, but worth noting for the DESIGN.md.

**Fix (deferred):** Add to DESIGN.md when it's created.

---

## Outside Voice — CLAUDE SUBAGENT (design consistency) [single-model]

Subagent confirmed findings 1, 2, 3, 4, and found two additional:
- **Border-radius rule is implicit** — `rounded-2xl` for cards, `rounded-xl` for inputs, `rounded-lg` for tab items, with no documented semantic rule.
- **Header pattern copy-pasted 4 times** — no shared `ScreenHeader` component, already diverging between screens.

Both are valid but architectural rather than visual polish. Added to TODOS.md.

---

## Quick Wins (< 30 min each)

1. **FAB font weight**: 1-line change in `index.tsx:108` — `font-light` → `font-bold`
2. **Korean label tracking**: Remove `uppercase tracking-widest` from 5 labels in `new.tsx`
3. **Empty state CTA**: Add 1 line of hint text to `EmptyState` in `index.tsx`
4. **Kakao color constant**: Add to `constants.ts`, update `login.tsx`

---

## Fix Summary

| Finding | Impact | Status |
|---------|--------|--------|
| FINDING-001: Empty state missing CTA | High | To fix |
| FINDING-002: Accessibility absent | High | Deferred (too broad) |
| FINDING-003: FAB font-light | Medium | To fix |
| FINDING-004: Korean tracking-widest | Medium | To fix |
| FINDING-005: Emoji scan button | Medium | To fix |
| FINDING-006: Kakao color undocumented | Polish | To fix |
| FINDING-007: Font semantic names | Polish | Deferred to DESIGN.md |

---

*Report generated by /design-review on 2026-04-02*
