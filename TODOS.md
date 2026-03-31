# wediary TODOs

## [ ] signed URL 만료 시 자동 갱신
**What:** photoUrls 상태가 1시간 후 만료된 signed URL을 갱신하지 않음.
**Why:** 상세 화면을 1시간 이상 열어두면 사진이 조용히 깨짐 (catch{} 때문에 에러도 안 뜸).
**Pros:** 사용자가 장시간 화면 열어두는 경우 사진 항상 정상 표시.
**Cons:** 타이머 로직 추가 or RQ staleTime 조정 필요.
**Context:** [id].tsx. photoUrls는 raw state. Promise.all 리팩토링 완료됨 — 이제 URL 갱신 로직 추가 가능. React Query의 staleTime/refetchInterval로 자동 갱신하거나, 만료 직전 타이머로 재요청하는 방식.
**Depends on:** ~~Promise.all 리팩토링~~ (완료 2026-03-31).

## [ ] memories 테이블 wedding_id UNIQUE 제약 확인
**What:** Supabase memories 테이블에 wedding_id UNIQUE 제약이 실제로 있는지 확인.
**Why:** 없으면 빠른 더블탭 시 중복 rows 생성, getMemory의 maybeSingle()이 에러 유발.
**Pros:** 데이터 무결성 보장.
**Cons:** 마이그레이션 작성 필요 (이미 있으면 0 비용).
**Context:** upsertMemory는 onConflict: 'wedding_id'에 의존. 제약 없으면 충돌 감지 안 됨.
**Depends on:** Supabase 대시보드 또는 마이그레이션 파일 확인.

## [ ] 테스트 인프라 설정 (Jest)
**What:** Expo 내장 Jest 설정을 활성화하고 lib/db.ts 순수 함수 단위 테스트 작성.
**Why:** 현재 테스트 0%. isUpcoming 수정 같은 로직 변경 시 회귀 보호 없음.
**Pros:** formatDateKR, isUpcoming 같은 함수는 5분이면 테스트 가능. 이후 변경에 안전망.
**Cons:** 초기 설정 시간 ~30분.
**Context:** Expo 프로젝트는 package.json에 jest 설정 추가만 하면 됨. react-native preset 사용.
  시작 파일: `app/__tests__/db.test.ts`
  우선순위 테스트: formatDateKR, isUpcoming(날짜 기준), handleSave 유효성 검증.
**Depends on:** 없음. 지금 당장 시작 가능.

---

## Design findings (from /design-review, 2026-03-31)

### [x] FINDING-002 — ActivityIndicator 색상 통일 (FIXED)
`#FF69B4` (CSS hotpink) → `#f472b6` (Tailwind pink-400). index.tsx, new.tsx, [id].tsx 3파일.

### [x] FINDING-003 — 불러오기 버튼 sky-400 → pink-400 (FIXED)
primary action 버튼은 pink-400 사용. new.tsx:147.

### [x] FINDING-004 — 편집 링크 sky-400 → pink-400 (FIXED)
sky-400은 이 앱에서 "미정" 상태를 의미. 편집 링크는 pink-400으로 통일. [id].tsx:173.

### [x] FINDING-005 — 상세 화면 필드 라벨 스타일 통일 (FIXED)
메모/감정/축의금/사진 라벨에 `uppercase tracking-widest` 추가. [id].tsx.

### [ ] FINDING-001 — 출석 상태 뱃지 렌더링 불일치 (DEFERRED, medium)
**What:** 홈 리스트에서는 `text-lime-400` 인라인 텍스트, 상세 화면에서는 `bg-lime-400` 필 배지. ATTENDANCE_COLOR 맵이 두 파일에 중복 (다른 값으로).
**Fix:** 공유 컴포넌트 또는 공유 상수로 추출. index.tsx:13-17, [id].tsx:17-21.

### [ ] FINDING-007 — 데스크탑 max-width 없음 (DEFERRED, medium)
**What:** 1280px 데스크탑에서 탭바와 컨텐츠가 화면 전체 폭으로 늘어남.
**Fix:** 각 화면 root View에 `max-w-sm mx-auto w-full` 추가 또는 `_layout.tsx`에서 wrapper 적용.
**Note:** 모바일 앱이라 의도적일 수 있음.
