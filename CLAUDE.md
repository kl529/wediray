## 프로젝트 개요

결혼식 청첩장 관리 React Native 앱 (Expo 54). 모바일 우선, PWA 웹 배포 병행.

**앱 실행:** `cd app && npm run ios` (또는 `npm run web`)
**웹 배포:** `cd app && npx expo export --platform web && vercel deploy dist --prod`
**라이브 URL:** https://wediary-lyvas-projects.vercel.app
**주요 파일:** `app/app/(app)/` — 화면들, `app/lib/db.ts` — Supabase 쿼리
**백엔드:** Supabase (Auth, Postgres, Storage, Edge Functions)
**스타일:** NativeWind (Tailwind 클래스명 사용)

## 테스트 시나리오

표준 테스트 시나리오: `.gstack/test-scenarios.md`
- QA 실행 시 이 파일의 SC-01~SC-14 시나리오를 순서대로 진행 (SC-13~14는 네이티브 전용)
- 스크린샷: `.gstack/qa-reports/screenshots/` 에 저장
- URL: `http://localhost:8081` (Expo web)

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.
