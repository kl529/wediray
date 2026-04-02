# wediary TODOs

---

## 세션 2026-04-02 작업 내역

### [x] parse-invitation Edge Function 버그 수정 (commit: 9ad278c, 185fa2e)
- `naver.me` 단축 URL → `link.naver.com/bridge` redirect 처리 (`url=` 파라미터 추출 후 재fetch)
- og:title `"승욱 ♡ 지영"` 패턴으로 이름 추출
- `id="eventDate"` hidden input으로 날짜 추출 (barunsoncard 등)
- 날짜 로직 버그 수정 (ISO 포맷 `m[1]` 직접 사용, 연도만 반환하던 문제)
- `<div class="text-wrapper-2">` 로 장소 추출 (날짜와 구분)
- 성+이름 풀네임 추출: og:title 짧은 이름에서 `[가-힣]이름` 패턴으로 성 찾기

### [x] OCR 스캔 기능 추가 (commit: 7f75c68)
- `@react-native-ml-kit/text-recognition` 설치 (온디바이스 OCR, API 비용 없음)
- `app/lib/ocr.ts`: `pickAndOcr()` + `parseOcrText()` — 신랑/신부/날짜/장소 regex
- `new.tsx`: "청첩장 사진으로 스캔" 버튼 (카메라 촬영 / 갤러리 선택) — 추가/수정 모두 적용
- `NSCameraUsageDescription` 권한 추가 (app.json)
- **주의:** 네이티브 모듈이라 `npm run ios` 빌드 필요 (Expo Go 불가)

### [x] 캘린더 연동 기능 추가 (commit: 7f75c68, 9879f98, 2ba0139)
- `expo-calendar` 설치
- `app/lib/calendar.ts`: `addWeddingToCalendar()` — 하루 전 알림 포함
- `[id].tsx`: 참석여부 뱃지 옆 `📅 캘린더` 버튼
- iOS: `getDefaultCalendarAsync()`
- Android: `allowsModifications` 필터 → `isPrimary` → `com.google` 우선 선택
- Android ClassCastException 수정: `allDay: true` 제거 → 00:00~23:59 시간 범위 사용
- `NSCalendarsUsageDescription`, `READ_CALENDAR`, `WRITE_CALENDAR` 권한 추가

### [x] Android 에뮬레이터 세팅 (완료 2026-04-02)
**현재 상태:**
- Android Studio 설치 완료: `/Applications/Android Studio.app`
- Android SDK 위치: `~/Library/Android/sdk`
- sdkmanager: `~/Library/Android/sdk/cmdline-tools/latest/bin/sdkmanager`
- OpenJDK 17: `/opt/homebrew/opt/openjdk@17`
- system-image 다운로드 중 (백그라운드 작업 `b3rrgwjp2` — `system-images;android-35;google_apis;arm64-v8a`)

**완료된 작업:**
- system-image `android-35;google_apis;arm64-v8a` 설치
- AVD `wediary_test` 생성 (Pixel 7 / API 35)
- `npx expo run:android`로 네이티브 빌드 완료
- `com.lyvakim.wediary` 에뮬레이터에 설치 및 실행 확인

**다음 실행 방법:**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
emulator -avd wediary_test -no-audio &
# 부팅 후
cd app && npx expo run:android
```

---

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

## [x] Phase 5-03 — App Store Prep (완료 2026-03-31)

### [x] PIPA 개인정보처리방침
- 앱 내 화면: `app/app/(app)/privacy.tsx` (설정에서 접근)
- 호스팅용 HTML: `docs/privacy-policy.html`
- **배포 필요:** HTML을 웹에 올리고 App Store Connect에 URL 입력

### [x] EAS 빌드 구성
- `app/eas.json` — development / preview / production 프로필
- `app/app.json` — 번들 ID (`com.lyvakim.wediary`), 권한, 다크모드, splashScreen
- **남은 작업:** `eas build:configure` 실행하여 `projectId` 자동 입력

### [x] 앱스토어 메타데이터
- `docs/app-store-metadata.md` — 설명, 키워드, 스크린샷 가이드, 빌드 명령어

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
