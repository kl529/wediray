# wediary TODOs

## [x] signed URL 만료 시 자동 갱신 (완료 2026-03-31)
**Fix:** `photos` 쿼리에 `refetchInterval: 55 * 60 * 1000` 추가. URL 로드 effect에서 기존 URL 필터 제거 → photos 리페치 시 전체 URL 갱신.
**Commit:** c804bba — `[id].tsx`

## [x] memories 테이블 wedding_id UNIQUE 제약 확인 (완료 2026-03-31)
**Fix:** `supabase/migrations/20260331000000_memories_unique_wedding_id.sql` 작성.
`CREATE UNIQUE INDEX IF NOT EXISTS memories_wedding_id_unique ON memories (wedding_id)`
**적용 방법:** `supabase db push` 또는 Supabase 대시보드 SQL Editor에서 직접 실행.
**Commit:** 6ff4993

## [x] 테스트 인프라 설정 (완료 2026-03-31)
**Fix:** `jest-expo` preset, `app/__tests__/db.test.ts` 생성.
**실행:** `cd app && npm test`
**테스트 목록 (7개 통과):**
- `formatDateKR`: 날짜 포맷, 앞자리 0 제거, 12월
- `isUpcoming`: 오늘/미래 = true, 과거 = false (fake timer 사용)
**Commit:** 437b2c0

---

## Design findings (from /design-review, 2026-03-31) — 모두 완료

### [x] FINDING-001 — 출석 상태 상수 공유화
`lib/constants.ts`에 `ATTENDANCE_LABEL`, `ATTENDANCE_TEXT_COLOR`, `ATTENDANCE_PILL_BG` 추출. commit: 768a2d1.

### [x] FINDING-002 — ActivityIndicator 색상 단일화
`#FF69B4` → `BRAND_PINK` (`#f472b6`). commit: 481690f, 768a2d1.

### [x] FINDING-003 — 불러오기 버튼 sky-400 → pink-400
commit: 3b73d9a.

### [x] FINDING-004 — 편집 링크 sky-400 → pink-400
commit: c825ff8.

### [x] FINDING-005 — 상세 화면 필드 라벨 스타일 통일
메모/감정/축의금/사진 라벨에 `uppercase tracking-widest` 추가. commit: 9fdf107.

### [x] FINDING-007 — 데스크탑 max-width
`(app)/_layout.tsx`에서 web일 때 `maxWidth: 430, alignSelf: 'center'`. `global.css`에 `body { background: #000 }`. commit: 1007b64, e5d02a0.
