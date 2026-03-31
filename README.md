# wediary

결혼식 청첩장 관리 앱. 참석할 결혼식을 기록하고, 기억과 사진을 남기고, 축의금을 추적합니다.

## 기능

- **결혼식 관리** — 신랑/신부 이름, 날짜, 장소, 참석 여부 저장
- **청첩장 자동 파싱** — 청첩장 링크 입력 시 정보 자동 추출 (Supabase Edge Function)
- **기억 기록** — 메모, 감정 태그(6종), 축의금 금액
- **사진 첨부** — 결혼식별 최대 3장 (Supabase Storage)
- **탭 구분** — 예정(오늘 이후 날짜) / 참석완료(이미 지난 날짜) 구분

## 스택

| 레이어 | 기술 |
|--------|------|
| 앱 | Expo 54 + React Native 0.81 |
| 라우팅 | expo-router 6 |
| 스타일 | NativeWind (Tailwind CSS) |
| 서버 상태 | TanStack React Query |
| 백엔드 | Supabase (Postgres + Auth + Storage + Edge Functions) |

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

- **dev 모드**: 로그인 없이 앱 접근 가능 (`__DEV__` 체크로 auth redirect 건너뜀). DB 쓰기 작업은 실제 로그인 필요.
- **web 에러 피드백**: `Alert.alert`이 web에서 제대로 안 뜨는 경우를 대비해 폼에 인라인 에러 배너 추가됨.
