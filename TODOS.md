# wediary TODOs

## [ ] signed URL 만료 시 자동 갱신
**What:** photoUrls 상태가 1시간 후 만료된 signed URL을 갱신하지 않음.
**Why:** 상세 화면을 1시간 이상 열어두면 사진이 조용히 깨짐 (catch{} 때문에 에러도 안 뜸).
**Pros:** 사용자가 장시간 화면 열어두는 경우 사진 항상 정상 표시.
**Cons:** 타이머 로직 추가 or RQ staleTime 조정 필요.
**Context:** [id].tsx:70-90. photoUrls는 raw state. Promise.all 리팩토링 후 URL 갱신 로직도 같이 처리하면 좋음. React Query의 staleTime/refetchInterval로 자동 갱신하거나, 만료 직전 타이머로 재요청하는 방식.
**Depends on:** Promise.all 리팩토링 (이슈 4) 먼저.

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
