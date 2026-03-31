# App Store 메타데이터

## 기본 정보

| 항목 | 값 |
|------|-----|
| 앱 이름 | wediary |
| 번들 ID | com.lyvakim.wediary |
| 버전 | 1.0.0 |
| 빌드 번호 | 1 |
| 카테고리 | Lifestyle (라이프스타일) |
| 언어 | 한국어 (주), English (부) |
| 연령 등급 | 4+ |

---

## App Store Connect 설명 (한국어)

**앱 이름:** wediary — 결혼식 기억 다이어리

**부제 (서브타이틀, 30자 이내):**
```
결혼식 청첩장을 링크 하나로 기록하세요
```

**설명 (4000자 이내):**
```
wediary는 소중한 결혼식 기억을 한 곳에 모아두는 앱입니다.

청첩장 URL 하나만 붙여넣으면 신랑·신부 이름, 날짜, 장소가 자동으로 입력됩니다.
번거로운 수기 입력 없이 3초 만에 결혼식을 등록하세요.

[ 주요 기능 ]
• 청첩장 링크 자동 파싱 — 이름·날짜·장소 자동 입력
• 참석 여부 기록 — 참석 / 불참 / 미정
• 감정 태그와 메모 — 그날의 느낌을 기록
• 축의금 금액 기록
• 사진 최대 3장 첨부
• 예정 / 지난 결혼식 탭으로 한눈에 관리

[ 개인정보 보호 ]
• 카카오 계정으로 간편 로그인
• 내 데이터는 오직 나만 볼 수 있습니다
• 언제든지 탈퇴하고 모든 데이터를 삭제할 수 있습니다
```

**키워드 (100자 이내, 쉼표 구분):**
```
결혼식,청첩장,축의금,결혼,웨딩,다이어리,기록,메모,일정
```

**지원 URL:**
```
https://jzaiyttrvwswmzrsqutt.supabase.co
```

**개인정보처리방침 URL:**
```
(배포 후 URL 입력 — 예: https://wediary.app/privacy)
```

---

## 스크린샷 가이드

### iPhone 6.9인치 (iPhone 16 Pro Max 기준, 필수)
1. **로그인 화면** — 카카오 시작하기 버튼
2. **홈 화면 — 예정 탭** — 카드 리스트 (더미 데이터 사용)
3. **홈 화면 — 지난 결혼식 탭** — 참석 완료 카드들
4. **새 결혼식 등록** — URL 입력 화면
5. **결혼식 상세** — 메모·감정·축의금·사진

### iPhone 6.5인치 (iPhone 11 Pro Max 기준, 권장)
위와 동일

---

## EAS 빌드 명령어

```bash
# 개발용 시뮬레이터 빌드
cd app && eas build --profile development --platform ios

# TestFlight 배포용 빌드
cd app && eas build --profile preview --platform ios

# 프로덕션 빌드 (App Store 제출용)
cd app && eas build --profile production --platform ios

# App Store 제출
cd app && eas submit --platform ios --latest
```

## 사전 작업 체크리스트

- [ ] `eas login` — EAS CLI 로그인
- [ ] `eas build:configure` — 프로젝트 초기화 (projectId 자동 설정)
- [ ] App Store Connect에서 앱 생성 (번들 ID: `com.lyvakim.wediary`)
- [ ] `eas.json`의 `appleId`, `ascAppId`, `appleTeamId` 입력
- [ ] 개인정보처리방침 URL 호스팅 (GitHub Pages 또는 Supabase Edge Function)
- [ ] 스크린샷 촬영 (Simulator 또는 실기기)
- [ ] Apple Developer Program 가입 확인 ($99/년)
