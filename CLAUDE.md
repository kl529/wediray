## 프로젝트 개요

결혼식 청첩장 관리 React Native 앱 (Expo 54). 모바일 우선, web은 개발 테스트용.

**앱 실행:** `cd app && npm run ios` (또는 `npm run web`)
**주요 파일:** `app/app/(app)/` — 화면들, `app/lib/db.ts` — Supabase 쿼리
**백엔드:** Supabase (Auth, Postgres, Storage, Edge Functions)
**스타일:** NativeWind (Tailwind 클래스명 사용)

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
