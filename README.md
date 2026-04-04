# wediary

결혼식 청첩장 관리 앱. 참석할 결혼식을 기록하고, 기억을 남기고, 축의금을 추적합니다.

## 기능

- **결혼식 관리** — 신랑/신부 이름, 날짜, 시간, 장소, 참석 여부 저장 (신랑/신부는 필수 입력)
- **청첩장 자동 파싱** — 청첩장 링크 입력 시 정보 자동 추출 (Supabase Edge Function)
- **청첩장 OCR 스캔** — 카메라/갤러리로 청첩장 사진 촬영 후 정보 자동 인식 (온디바이스 ML Kit)
- **기억 기록** — 메모, 축의금 금액
- **D-Day 카운트다운** — 모든 예정 결혼식에 D-N 표시 (홈 목록 + 상세 화면)
- **청첩장 링크 표시** — 등록된 청첩장 URL을 상세 화면에서 확인 가능
- **캘린더 연동** — 결혼식 일정을 iOS/Android 기기 캘린더에 추가 (하루 전 알림 포함)
- **탭 구분** — 예정(오늘 이후 날짜) / 지난 결혼식(이미 지난 날짜) 구분
- **참석 여부 시각화** — 카드 border 색으로 구분: 참석(연두), 불참(빨강), 미정(기본)
- **카카오 로그인** — Kakao OAuth2 소셜 로그인 (Supabase Auth + expo-web-browser)

## 스택

| 레이어 | 기술 |
|--------|------|
| 앱 | Expo 54 + React Native 0.81 |
| 라우팅 | expo-router 6 |
| 스타일 | NativeWind (Tailwind CSS) |
| 폰트 | Gaegu (한국어 손글씨), Fredoka (영문 로고) |
| 서버 상태 | TanStack React Query |
| 백엔드 | Supabase (Postgres + Auth + Storage + Edge Functions) |
| OCR | @react-native-ml-kit/text-recognition (온디바이스) |
| 빌드 | EAS Build (Expo Application Services) |

## 시작하기

```bash
cd app
cp .env.example .env   # EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY 입력
npm install
npm run ios            # iOS 시뮬레이터
npm run android        # Android 에뮬레이터
npm run web            # 브라우저 (개발/테스트용)
```

### 환경 변수

```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

> **EAS 클라우드 빌드 시**: `.env` 파일은 gitignore되어 클라우드에 포함되지 않음.
> `eas env:create` 로 EAS 대시보드에 위 두 변수를 등록해야 빌드가 정상 동작.

### Android 빌드 요구 사항

- **Java 17** 필수 (Java 11 이하에서 Gradle 빌드 실패)
  ```bash
  brew install --cask temurin@17
  export JAVA_HOME=$(/usr/libexec/java_home -v 17)
  ```
- **Android 에뮬레이터 실행**:
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
  emulator -avd wediary_test -no-audio &
  cd app && npx expo run:android
  ```

### Kakao OAuth 설정

카카오 로그인은 별도 설정 없이 개발 모드(`__DEV__`)에서는 우회 가능. 실제 카카오 로그인 연동 시:

1. [Kakao Developers](https://developers.kakao.com) 에서 앱 생성
2. 플랫폼 → Android/iOS 번들 ID 등록 (`com.lyvakim.wediary`)
3. 카카오 로그인 활성화, 동의항목: `profile_nickname`, `account_email`
4. Redirect URI: `https://[supabase-project].supabase.co/auth/v1/callback`
5. Supabase Dashboard → Auth → Providers → Kakao: REST API 키 입력
6. Supabase → Auth → URL Configuration → Redirect URLs에 `wediary://callback` 추가

## 프로젝트 구조

```
wediary/
├── app/                    # Expo 앱
│   ├── app/
│   │   ├── (auth)/         # 로그인, OAuth 콜백
│   │   └── (app)/          # 홈, 새 결혼식, 상세, 설정
│   └── lib/
│       ├── db.ts           # Supabase 쿼리 함수
│       └── supabase.ts     # 클라이언트 초기화
└── supabase/
    └── functions/
        └── parse-invitation/   # 청첩장 URL 파싱 Edge Function
```

## 개발 노트

- **dev 모드**: 로그인 화면 하단 "로그인 없이 계속" 버튼으로 익명 로그인 가능 (`supabase.auth.signInAnonymously()`). DB 쓰기 포함 모든 기능이 동작하며, Supabase Dashboard → Authentication → Providers → Anonymous에서 익명 로그인이 활성화되어 있어야 함.
- **web 에러 피드백**: `Alert.alert`이 web에서 제대로 안 뜨는 경우를 대비해 폼에 인라인 에러 배너 추가됨.
- **OAuth deep link**: Expo Router의 `(auth)` 그룹은 URL에서 투명하게 처리됨. `callback.tsx`의 실제 딥링크는 `wediary://callback` (not `wediary://auth/callback`).
- **OCR**: 네이티브 모듈(`@react-native-ml-kit/text-recognition`) 사용으로 `npx expo run:ios` 또는 EAS 빌드 필요. Expo Go 불가.
- **EAS APK 빌드**: `cd app && eas build --platform android --profile preview`
