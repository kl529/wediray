# wediary TODOs

---

## ERD·스펙·UX 검수 (2026-04-03, /design-review)

### [x] H-01: 불참 배지 텍스트 대비율 수정 — 수정됨 (commit: 2f2d9a5)
- `lib/constants.ts` — `ATTENDANCE_PILL_TEXT` 상수 추가, absent = text-white/50
- `[id].tsx` — text-black 하드코딩 제거, ATTENDANCE_PILL_TEXT 사용

### [x] M-01: iOS 축의금 number-pad 키보드 — 수정됨 (commit: f24539a)
- `[id].tsx` — iOS에서 keyboardType = number-pad (소수점 방지)

### [x] M-06: 지난 결혼식 빈 상태 도움말 — 수정됨 (commit: f24539a)
- `index.tsx` — "결혼식 카드에서 기억을 기록하면 여기에 나타나요" 추가

### [x] H-03: 홈 에러 상태 없음 — 수정됨 (commit: f24539a)
- `index.tsx` — isError 처리 추가 (에러 시 안내 메시지 표시)

### [ ] H-02: 기억 수정 후 저장 없이 나가면 변경사항 유실
- `[id].tsx` — 변경 여부 감지 후 뒤로 버튼 시 경고 Alert, 또는 자동저장(debounce)
- 우선순위: HIGH

### [ ] M-02: 축의금 숫자 포맷팅 (100000 → 100,000)
- `[id].tsx` — toLocaleString('ko-KR') 또는 포맷 함수 추가
- 우선순위: MEDIUM

### [ ] M-03: OCR 스캔 버튼을 카메라/갤러리 두 개로 분리
- `new.tsx` — Alert 중간 단계 제거, 버튼 두 개 직접 노출
- 우선순위: MEDIUM

### [ ] M-04: 참석 여부 상세 화면에서 바로 변경 가능하도록
- `[id].tsx` — 배지 탭 → 인라인 선택기 표시
- 우선순위: MEDIUM

### [ ] M-07: 결혼식 삭제 시 photos/memories DB 레코드 잔류 확인
- DB에 ON DELETE CASCADE 미설정 시 orphan 레코드 남을 수 있음
- Supabase 대시보드에서 CASCADE 확인 또는 앱에서 명시적 삭제 추가
- 우선순위: MEDIUM

### [ ] P-01: 설정 화면 앱 버전 표시
- `settings.tsx` — Constants.expoConfig?.version 표시
- 우선순위: POLISH

### [ ] P-03: 상세 화면 헤더 중앙에 이름 표시 (스크롤 시 가려짐)
- `[id].tsx` — ScreenHeader center에 "{groom} ♥ {bride}" 추가
- 우선순위: POLISH

### [ ] P-05: 사진 추가 시 카메라 직접 촬영 옵션
- `[id].tsx` — launchCameraAsync 옵션 추가
- 우선순위: POLISH

### [ ] P-06: 지난 결혼식 탭 날짜 역순 정렬
- `lib/db.ts` — getWeddings에서 탭별 정렬 지원 또는 앱 레벨 sort 추가
- 우선순위: POLISH

---

## 세션 2026-04-03 작업 내역

### [x] EAS Build 설정 완료
- `app.json`에서 `runtimeVersion` 블록 제거 (`expo-updates` 미설치 상태에서 오류 발생)
- EAS 프로젝트 생성: `eas init --force` → projectId `a9bf549f-ac7f-46d4-bbc9-063f96d7876f`
- EAS 대시보드에 환경 변수 등록: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  (`.env`는 gitignore됨 — 클라우드 빌드에 포함되지 않으므로 EAS 대시보드 등록 필수)
- `expo-web-browser` 플러그인 `app.json` plugins 배열에 추가
- APK 빌드: `eas build --platform android --profile preview`

### [x] Kakao OAuth 구현 (commit: login.tsx 수정)
- `expo-web-browser` 설치, `WebBrowser.openAuthSessionAsync()` 사용
- `skipBrowserRedirect: true` + `exchangeCodeForSession(result.url)` PKCE 플로우
- `scopes: 'profile_nickname account_email'` — 카카오 동의항목에 없는 scope 요청 시 오류 발생
- `redirectTo: 'wediary://callback'` — `(auth)` 그룹은 URL에서 투명하게 처리됨
- Supabase URL Configuration에 `wediary://callback` 추가 (not `wediary://auth/callback`)
- `_layout.tsx` auth redirect: `!__DEV__` 조건 복원 (에뮬레이터 테스트 후)

### [x] Android 에뮬레이터 로컬 빌드 (Java 17)
- Java 17 (`temurin@17`) 설치 — Java 11에서 Gradle 빌드 실패
- `export JAVA_HOME=$(/usr/libexec/java_home -v 17)` 환경 설정
- `npx expo run:android`로 에뮬레이터 `wediary_test`에 로컬 빌드 및 실행

### [x] UI 일관성 수정
- `new.tsx` "자동 입력" 섹션 레이블에 `uppercase tracking-widest` 추가
- `new.tsx` 저장 실패/유효성 오류: Alert 중복 제거, 인라인 배너만 사용
- `[id].tsx` 뒤로 버튼 `py-2` 추가 (터치 영역 확보)

---

## Design Review 발견 이슈 (2026-04-02, /design-review by gstack)

### [x] FINDING-001: 빈 상태에 FAB 안내 텍스트 추가 — 수정됨 (commit: 08d8039)
- `app/app/(app)/index.tsx` — EmptyState에 "오른쪽 아래 + 버튼으로 추가해보세요" 안내 추가

### [x] FINDING-003: FAB + 아이콘 font-light → font-bold — 수정됨 (commit: 171bf4e)
- `app/app/(app)/index.tsx:108`

### [x] FINDING-004: 한국어 섹션 레이블 uppercase tracking-widest 제거 — 수정됨 (commit: 315dd19)
- `app/app/(app)/new.tsx` — 5개 레이블에서 uppercase tracking-widest 제거

### [x] FINDING-005: 스캔 버튼 📷 이모지 제거 — 수정됨 (commit: 456130b)
- `app/app/(app)/new.tsx:192`

### [x] FINDING-006: KAKAO_YELLOW 상수화 — 수정됨 (commit: 997c4e5)
- `app/lib/constants.ts` + `app/app/(auth)/login.tsx`

### [x] FINDING-002: 접근성(Accessibility) 전체 부재 — 수정됨 (commit: 0bbb8cf)
- 5개 화면 전체 인터랙티브 요소에 accessibilityLabel/Role/State 추가
- index(FAB·탭·설정버튼·카드), settings(뒤로·약관·로그아웃), privacy(뒤로)
- [id](뒤로·편집·삭제·캘린더·사진·감정태그·저장), new(취소·저장·불러오기·스캔·참석여부)

### [x] DESIGN-TODO-001: 공유 ScreenHeader 컴포넌트 추출 — 수정됨 (commit: bf5bb08)
- `app/components/ScreenHeader.tsx` 생성 (left/center/right 슬롯)
- settings, privacy, [id], new 4개 화면 헤더 교체

### [x] DESIGN-TODO-002: border-radius 계층 명문화 — 수정됨 (commit: 5e3bbbc)
- `tailwind.config.js`에 card(16px)/input(12px)/tab(8px)/pill(9999px) 시맨틱 토큰 추가

### [x] DESIGN-TODO-003: 커스텀 폰트 도입 — 수정됨 (commit: 73e6278)
- `@expo-google-fonts/gaegu`, `@expo-google-fonts/fredoka` 설치
- "wediary" 로고 → Fredoka_600SemiBold, "설정"/"개인정보처리방침" → Gaegu_700Bold
- `_layout.tsx`에 useFonts + SplashScreen 연동

---

## QA 발견 이슈 (2026-04-02, /qa by gstack)

### [x] ISSUE-001: DEV 캘린더 테스트 버튼 설정화면 노출 — 수정됨 (commit: bd3e364)
- `__DEV__` 조건으로 감싸 EAS 프로덕션 빌드에서 숨김
- `app/app/(app)/settings.tsx`

### [x] ISSUE-002: 저장 실패 시 에러 배너가 스크롤 위에 숨겨짐 — 수정됨 (commit: 1f2f818)
- `app/app/(app)/new.tsx` — ScrollView ref 추가, 에러 시 scrollTo({ y: 0, animated: true }) 호출
- handleSave 유효성 오류 + mutation onError 양쪽 처리

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
