# E2E Test Cases — wediary

**Format**: AAA (Arrange-Act-Assert)
**Source of truth**: This file. `TEST-EXECUTION-TRACKING.csv` = status only.
**Platform key**: W=Web, i=iOS, A=Android
**Priority**: P0=blocker, P1=critical, P2=high, P3=medium

---

## TC-E2E-001 — 홈 화면 정상 로드

**ID**: TC-E2E-001
**Priority**: P1
**Platform**: W / i / A
**Linked scenario**: SC-01

### Arrange
- 앱 실행 후 로그인 완료 상태
- DB에 결혼식 데이터 없음 (또는 있음)

### Act
1. 앱 실행
2. 로그인 (Web: 익명, iOS/Android: 카카오)
3. 홈 화면 진입 확인

### Assert
- ✅ "wediary" 로고 핑크 색상으로 표시
- ✅ 우상단 설정 아이콘 (⚙️) 표시
- ✅ "예정" / "지난 결혼식" 탭 표시
- ✅ 결혼식 없으면 빈 상태(💌) 메시지 표시
- ✅ 우하단 "+" FAB 버튼 표시
- ✅ 콘솔 에러(빨간) 없음

### Edge Cases
- **네트워크 차단 시**: 에러 메시지 + "다시 시도" 버튼 표시
- **"다시 시도" 탭**: `refetch()` 호출, 로딩 스피너 표시

---

## TC-E2E-002 — 탭 전환

**ID**: TC-E2E-002
**Priority**: P2
**Platform**: W / i / A
**Linked scenario**: SC-02

### Arrange
- 홈 화면 진입 상태

### Act
1. "지난 결혼식" 탭 탭
2. 상태 확인
3. "예정" 탭 탭
4. 원복 확인

### Assert
- ✅ "지난 결혼식" 탭 활성화 (핑크 배경)
- ✅ 지난 결혼식 목록 또는 빈 상태(📖) 표시
- ✅ "예정" 탭 다시 탭 시 원복

---

## TC-E2E-003 — 새 결혼식 폼 렌더링 및 유효성 검사

**ID**: TC-E2E-003
**Priority**: P1
**Platform**: W / i / A
**Linked scenario**: SC-03

### Arrange
- 홈 화면 진입 상태

### Act
1. "+" FAB 버튼 탭
2. 빈 폼 확인
3. 이름 없이 "저장" 탭 (에러 케이스)
4. 내용 입력 후 "취소" 탭 (dirty state 케이스)
5. URL 형식 없이 "불러오기" 탭 (URL 검증 케이스)

### Assert
**폼 렌더링:**
- ✅ 청첩장 URL 입력 필드 + "불러오기" 버튼
- ✅ iOS/Android: 카메라 촬영 / 갤러리 선택 버튼 (Web: 숨김)
- ✅ 신랑/신부 이름 필드 (`*` 필수 표시)
- ✅ 날짜 선택기 (오늘 날짜 기본값)
- ✅ 장소 입력 필드
- ✅ 참석 여부 선택 (기본값: 미정)
- ✅ 취소 / 저장 버튼

**유효성 검사:**
- ✅ 빈 이름 저장 → 에러 배너 "신랑 또는 신부 이름을 입력해주세요"
- ✅ 내용 입력 후 취소 → "저장하지 않은 변경사항" Alert
- ✅ `http://` 없는 URL → 형식 오류 Alert

---

## TC-E2E-004 — 결혼식 저장 E2E

**ID**: TC-E2E-004
**Priority**: P0
**Platform**: W / i / A
**Linked scenario**: SC-04

### Arrange
- 새 결혼식 폼 열린 상태

### Act
1. 신랑: `테스트신랑`, 신부: `테스트신부` 입력
2. 날짜: 미래 날짜 선택
3. 장소: `테스트홀` 입력
4. 참석: "참석" 선택
5. "저장" 탭

### Assert
- ✅ 저장 후 "캘린더에 추가할까요?" 모달 표시 (미래 날짜)
- ✅ "건너뛰기" → 홈으로 이동
- ✅ "추가" → 캘린더 등록 후 홈 이동 (iOS/Android only)
- ✅ 홈 "예정" 탭에 새 카드 표시 (`테스트신랑 ♥ 테스트신부`)
- ✅ D-Day 뱃지 표시 (D-N)
- ✅ 참석 border 라임 색상
- ✅ 홈 카드에 캘린더 버튼 **없음**

**Edge Cases:**
- 과거 날짜로 저장 → 캘린더 모달 없이 바로 홈 이동

---

## TC-E2E-005 — 상세 화면 렌더링

**ID**: TC-E2E-005
**Priority**: P1
**Platform**: W / i / A
**Linked scenario**: SC-05

### Arrange
- TC-E2E-004에서 생성한 결혼식 존재
- 홈 화면 진입 상태

### Act
1. 홈에서 결혼식 카드 탭

### Assert
- ✅ 헤더: 뒤로(`<`), 수정(✏️), 삭제(🗑️) 아이콘
- ✅ 웨딩 정보 카드(`rounded-2xl`) 표시
- ✅ 신랑♥신부 이름 가에구(Gaegu) 폰트
- ✅ 날짜 + D-Day 표시 (예정: D-N, 지난: N일 전)
- ✅ 장소 행: 탭 → 클립보드 복사 + "복사됨 ✓" 라임 피드백
- ✅ 장소 없는 결혼식: 장소 행 숨김
- ✅ 참석 뱃지 + 캘린더 버튼 같은 row
- ✅ 참석 뱃지 탭 → 인라인 3-버튼 선택기 전환
- ✅ invite_url 있는 경우: 탭=브라우저, 길게누르기=복사
- ✅ "추억 기록" 섹션 표시
- ✅ 예정: 캘린더 버튼 표시 / 지난: 캘린더 버튼 없음
- ✅ 메모 필드, 축의금 퀵셀렉트 (5만/10만/15만/20만), 저장 버튼

---

## TC-E2E-006 — 추억 저장 (메모/축의금)

**ID**: TC-E2E-006
**Priority**: P1
**Platform**: W / i / A
**Linked scenario**: SC-06

### Arrange
- 결혼식 상세 화면 진입 상태

### Act
1. 메모: `좋은 결혼식이었어요` 입력
2. 축의금: "5만" 탭 또는 `50000` 직접 입력
3. "기억 저장" 탭

### Assert
- ✅ 저장 버튼 "저장됨 ✓" (라임색)으로 2초간 변경
- ✅ 재진입 시 메모/축의금 값 유지
- ✅ 미저장 상태 뒤로 가기 → "저장하지 않은 변경사항" Alert

---

## TC-E2E-007 — 설정 화면

**ID**: TC-E2E-007
**Priority**: P2
**Platform**: W / i / A
**Linked scenario**: SC-07

### Arrange
- 홈 화면 진입 상태

### Act
1. 설정 아이콘 탭

### Assert
- ✅ `<` 뒤로 아이콘
- ✅ 사용자 이름/이메일 표시
- ✅ 개인정보처리방침 행 (`›` chevron)
- ✅ "로그아웃" 버튼 (빨간 텍스트)
- ✅ 앱 버전 표시 (v1.0.0)

---

## TC-E2E-008 — 로그아웃 확인 모달

**ID**: TC-E2E-008
**Priority**: P2
**Platform**: W / i / A
**Linked scenario**: SC-08

### Arrange
- 설정 화면 진입 상태

### Act
1. "로그아웃" 탭
2. 모달 확인
3. "취소" 탭

### Assert
- ✅ 확인 모달 표시 ("정말 로그아웃할까요?")
- ✅ "취소" 탭 → 모달 닫힘, 설정 화면 유지
- ✅ "로그아웃" 탭 → 로그인 화면으로 이동 (DB 세션 제거)

---

## TC-E2E-009 — 개인정보처리방침

**ID**: TC-E2E-009
**Priority**: P3
**Platform**: W / i / A
**Linked scenario**: SC-09

### Arrange
- 설정 화면 진입 상태

### Act
1. 개인정보처리방침 탭

### Assert
- ✅ `<` 뒤로 아이콘
- ✅ 섹션 1~6 정상 렌더링
- ✅ 담당자 정보 (5번 섹션) 실제 정보 표시

---

## TC-E2E-010 — 로그인 화면

**ID**: TC-E2E-010
**Priority**: P1
**Platform**: W / i / A
**Linked scenario**: SC-10

### Arrange
- 로그아웃 상태 or 세션 없는 앱 실행

### Act
1. 앱 접속

### Assert
- ✅ "wediary" 로고 표시
- ✅ "카카오로 시작하기" 버튼 표시
- ✅ "로그인 없이 계속 (테스트)" 버튼 — **개발 모드(`__DEV__`)에서만** 표시
- ✅ iOS/Android: 카카오 OAuth 로그인 정상 동작
- ✅ Kakao 로그인 실패 시 `Alert.alert('로그인 실패', ...)` 표시

---

## TC-E2E-011 — 지난 결혼식 수정 플로우

**ID**: TC-E2E-011
**Priority**: P2
**Platform**: W / i / A
**Linked scenario**: SC-11

### Arrange
- DB에 지난 날짜 결혼식 1개 이상 존재

### Act
1. "지난 결혼식" 탭
2. 카드 탭 → 상세 진입
3. ✏️ 탭 → 수정 폼 진입

### Assert
**목록:**
- ✅ 카드에 이름, 날짜 표시
- ✅ D-Day 뱃지 없음 (지난 결혼식)
- ✅ 날짜 내림차순 정렬

**상세:**
- ✅ 날짜 `N일 전` 형식
- ✅ 저장된 메모/축의금 표시

**수정 폼:**
- ✅ 모든 필드 (invite_url 포함) pre-populate

---

## TC-E2E-012 — 청첩장 URL 파싱

**ID**: TC-E2E-012
**Priority**: P1
**Platform**: W / i / A
**Linked scenario**: SC-12

### Arrange
- 새 결혼식 폼 열린 상태
- 실제 모바일 청첩장 URL (카카오/웨딩21 등) 준비

### Act
1. URL 필드에 청첩장 URL 붙여넣기
2. "불러오기" 탭

### Assert
- ✅ 로딩 중 버튼에 스피너 표시
- ✅ 파싱 성공: 신랑/신부/날짜/장소 자동 입력
- ✅ 파싱 실패: Alert 표시 (앱 크래시 없음) [BUG-01: 현재 미작동]
- ✅ invite_url 필드에 입력한 URL 유지

---

## TC-E2E-013 — OCR 갤러리 스캔

**ID**: TC-E2E-013
**Priority**: P2
**Platform**: i / A (Web 불가)
**Linked scenario**: SC-13

### Arrange
- iOS 시뮬레이터 또는 Android 에뮬레이터
- 시뮬레이터 사진첩에 청첩장 이미지 저장 완료

### Act
1. 새 결혼식 폼 → "갤러리 선택" 탭
2. 갤러리 권한 허용
3. 청첩장 이미지 선택

### Assert
- ✅ 갤러리 권한 요청 표시
- ✅ OCR 처리 중 로딩 표시
- ✅ 인식 성공: 신랑/신부/날짜/장소 중 1개 이상 자동 입력
- ✅ 인식 실패: "인식 실패" Alert (앱 크래시 없음)

---

## TC-E2E-014 — 캘린더 자동 추가

**ID**: TC-E2E-014
**Priority**: P2
**Platform**: i / A (Web 불가)
**Linked scenario**: SC-14

### Arrange
- iOS 시뮬레이터 또는 Android 에뮬레이터
- 미래 날짜 결혼식 1개 존재

### Act (경로 A — 저장 시 모달)
1. 미래 날짜로 결혼식 저장
2. "캘린더에 추가할까요?" 모달 → "추가" 탭

### Act (경로 B — 상세화면 버튼)
1. 예정 결혼식 상세 → 캘린더 pill 탭

### Assert
- ✅ 최초 실행 시 캘린더 권한 요청
- ✅ 권한 허용 후 등록 완료
- ✅ 기기 캘린더 앱에서 이벤트 확인 (이름, 날짜, 장소)
- ✅ 시간 있으면 정확한 시작 시간 + 2시간 범위
- ✅ 권한 거부 시 에러 메시지
- ✅ 상세화면 버튼: "추가됨" 라임 피드백 3초

---

## TC-SEC-001 — RLS 권한 격리

**ID**: TC-SEC-001
**Priority**: P0
**Platform**: W / i / A
**Category**: Security (OWASP A01)

### Arrange
- User A 계정으로 결혼식 생성
- User B 계정 준비

### Act
1. User B로 로그인
2. Supabase 직접 쿼리: `SELECT * FROM weddings WHERE user_id = '<User A UUID>'`

### Assert
- ✅ User B가 User A의 데이터 조회 불가 (RLS 차단)
- ✅ 앱 UI에 User B 자신의 데이터만 표시

---

## TC-SEC-002 — SSRF 보호 (Edge Function)

**ID**: TC-SEC-002
**Priority**: P1
**Platform**: W
**Category**: Security (OWASP A10)

### Arrange
- 새 결혼식 폼 열린 상태

### Act
1. URL 필드에 내부 IP URL 입력: `http://192.168.1.1` 또는 `http://localhost`
2. "불러오기" 탭

### Assert
- ✅ Edge Function에서 요청 차단
- ✅ 에러 응답 반환 (앱 크래시 없음)
- ✅ 내부 네트워크 노출 없음

---

## TC-SEC-003 — 인증 없는 직접 접근 차단

**ID**: TC-SEC-003
**Priority**: P0
**Platform**: W
**Category**: Security (OWASP A07)

### Arrange
- 비로그인 상태

### Act
1. 브라우저에서 `http://localhost:8081/` 직접 접근

### Assert
- ✅ 홈이 아닌 로그인 화면으로 리다이렉트
- ✅ `_layout.tsx` route guard 동작 확인
