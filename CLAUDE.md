# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

React 19 + TypeScript + Vite 기반 노트 앱 실습 프로젝트. 백엔드는 `json-server`로 모킹하며, `db.json`이 데이터 소스다.

- 앱: http://localhost:5173
- API: http://localhost:3001/notes

## 주요 명령어

```bash
npm run dev        # Vite 개발 서버 + json-server 동시 실행 (concurrently)
npm run server     # json-server만 단독 실행
npm run build      # tsc + vite build
npm run lint       # ESLint (--fix 포함)
npm run format     # Prettier
npm test           # Vitest 단일 실행
npm run test:watch # Vitest watch 모드
```

## 아키텍처

### 데이터 흐름

```
json-server (db.json)
    ↓ fetch
src/api/notes.ts        ← REST CRUD 함수 (fetchNotes, createNote, updateNote, deleteNote)
    ↓
src/context/NotesContext.tsx  ← 전역 상태 (notes[], loading, error) + 액션 (addNote, editNote, removeNote)
    ↓ useNotes()
src/components/         ← UI 컴포넌트
```

### 핵심 파일

| 파일 | 역할 |
|------|------|
| `src/types/note.ts` | `Note` 인터페이스 정의. 필드 추가 시 이곳부터 변경 |
| `src/api/notes.ts` | json-server REST API 호출. `createdAt`/`updatedAt` 타임스탬프 자동 주입 |
| `src/context/NotesContext.tsx` | `NotesProvider` + `useNotes()` hook. API 호출 후 로컬 state 낙관적 업데이트 |
| `src/App.tsx` | `selectedNoteId` / `isCreating` UI 상태 관리. `NotesProvider`로 앱 감쌈 |
| `db.json` | json-server 데이터 소스. 직접 편집해 초기 데이터 세팅 가능 |

### 컴포넌트 구조

```
App
└── NotesProvider (context)
    └── Layout (사이드바 + 메인 슬롯)
        ├── NoteList (사이드바) → NoteItem 목록
        └── NoteEditor (메인) — 선택/생성 모드 공용
```

### 상태 3계층 분리

| 계층 | 위치 | 내용 |
|------|------|------|
| 서버 상태 | `NotesContext` | notes[], loading, error |
| UI 선택 상태 | `App.tsx` | selectedNoteId, isCreating |
| 폼 로컬 상태 | `NoteEditor` | title, content, saving |

## 구현 패턴

### 컴포넌트

- `src/components/` 내 모든 컴포넌트는 **named export** (`export function X`)
- Props 타입은 컴포넌트 바로 위에 인라인 정의 (`interface [Component]Props { ... }`)
- 로딩/에러/빈 상태는 **early return(guard clause)** 으로 처리 후 메인 JSX 반환
- `Layout`은 `sidebar`/`main` ReactNode 슬롯 패턴 — 레이아웃과 콘텐츠를 완전히 분리

### 상태 관리

- Context 액션(`addNote`, `editNote`, `removeNote`)은 API 성공 후 로컬 state를 동기 업데이트 (낙관적 업데이트 아님)
- 비동기 저장 진행 중 상태는 컴포넌트 로컬 `saving` boolean으로 처리
- 컴포넌트는 API 함수를 직접 import하지 않고 반드시 `useNotes()` Context 액션을 통해서만 호출

### API 호출

- `src/api/notes.ts`는 순수 함수 모음. Context에서 `import * as api`로 namespace import
- `createdAt` / `updatedAt` 타임스탬프는 서버가 아닌 **클라이언트(`api/notes.ts`)에서 생성**
- 각 함수는 `res.ok` 실패 시 `Error`를 throw; 호출부에서 try/catch로 처리

### 네이밍

- 컴포넌트 내부 이벤트 핸들러: `handle[Action]` (예: `handleSave`, `handleNewNote`)
- Props 콜백: `on[Action]` (예: `onSelect`, `onDelete`, `onDone`)
- Context 액션 동사: `create` / `update` / `delete` (API 함수와 동일하게 통일)
- Tailwind 색상: 시맨틱 토큰 사용 (`text-foreground`, `bg-card`, `text-muted-foreground`, `text-destructive`)

## 발견된 불일치 (주의)

1. **export 방식**: `src/components/`는 전부 named export인데 `App.tsx`만 `export default App` 사용

## 테스트

- Vitest + @testing-library/react + jsdom 환경
- 설정: `vite.config.ts` → `test` 블록, `src/test-setup.ts`에서 `@testing-library/jest-dom` import
- `globals: true`라서 `describe`, `it`, `expect` import 불필요

## 디자인 시스템

모든 스타일 작업 시 `docs/design-system/README.md`를 반드시 참고할 것.

- **철학**: Soft Minimalism — 1px 실선 테두리 금지, 배경색 전환으로 depth 표현
- **색상**: surface 계층 토큰 사용, 액센트(`#0053dc`)는 CTA/focus에만
- **타이포**: Inter 단독, 순수 검정(`#000000`) 금지 → `#2b3437` 사용
- **간격**: 1.4rem 리듬 기준, 리스트 구분선 금지 → gap으로 대체
- 상세 토큰/컴포넌트 스펙/Do·Don't → `docs/design-system/README.md` 참조

## 기술 스택 메모

- **Tailwind CSS v4**: `@tailwindcss/vite` 플러그인 방식. `tailwind.config.js` 없음
- **json-server v1 beta**: `json-server@1.0.0-beta.3` — 라우트 문법이 v0과 다를 수 있음
- `Note.tags` 필드는 의도적으로 누락 — 추후 실습에서 추가 예정
