---
name: tdd-green
description: 실패하는 Vitest 테스트를 통과시키는 **최소한의 구현 코드**만 작성하는 TDD Green 단계 스킬. `/tdd-green <이슈번호>` 호출이나 사용자가 "Green 단계 시작", "테스트 통과시켜줘", "구현해줘", "Green 들어가자", "tdd-green 1" 같이 말할 때 반드시 사용한다. 이 스킬은 `src/`에 구현 코드를 작성하며 **테스트 파일은 절대 수정하지 않는다** — 한 번에 한 테스트씩 통과시켜 회귀 없이 전체 그린에 도달하는 게 목적이다.
context: fork
---

# TDD Green Skill

빨갛게 깨진 테스트를 **가장 단순한 구현**으로 하나씩 통과시킨다. TDD 사이클의 두 번째 단계.

근거: 시그니처와 시나리오는 `docs/features/{feature}/issue-{N}.md` 에 확정되어 있고, 실패하는 테스트는 tdd-red 스킬이 이미 만들어 두었다.

---

## 입출력 계약

### 입력
- `$ARGUMENTS` — 이슈 번호 (예: `1`)
- `docs/features/{feature}/issue-{N}.md` — 시그니처 + 시나리오 + 체크박스 진행 상태
  - `{feature}` 폴더는 현재 작업 컨텍스트(브랜치, 최근 작업)로 식별. 모호하면 사용자에게 묻는다.
- 이미 작성된 실패 테스트들 — `*.test.ts(x)`

### 산출물
- `src/` 안의 구현 코드 (훅, 컴포넌트, Context 액션, API 함수 등)
- `npm test` 전체 통과 (신규 + 기존)
- `issue-{N}.md` 의 체크박스가 `- [x]` 로 갱신된 상태
- 커버리지 리포트 + 미커버 라인 보고

---

## TDD Green 단계의 본질

> **"통과시키는 가장 짧은 길을 간다."**

Green은 설계를 자랑하는 단계가 아니다. 테스트가 빨갛다 → 가장 단순한 구현 → 초록. 추상화·확장 포인트·미래 대비는 **다음 사이클(Refactor)** 의 몫이다. 지금 추가하면 "테스트가 검증하지 않는 코드"가 늘어나 회귀 안전망 밖으로 나간다.

### 좋은 Green의 모양

| 종류 | 모양 | 의미 |
|------|------|------|
| 하드코딩 | `return 'react'` | 한 테스트만 있을 때 충분히 단순 — 다음 테스트가 일반화를 강제한다 |
| 직접 대응 | `if (tag.trim() === '') return` | 시나리오가 요구하는 분기만 |
| 명시적 호출 | `await api.createNote({ title, content, tags })` | 테스트가 spy로 검증하는 호출을 그대로 |

### 나쁜 Green (피해야 함)

- 테스트에 없는 옵션/파라미터를 미리 받음 (`options?: { dedupe?: boolean }`)
- "나중에 쓸 것 같아서" 헬퍼/유틸을 분리
- 시나리오에 없는 검증 분기를 추가 (`if (tags.length > 10) throw ...`)
- 디자인 스펙에 없는 시각 요소 추가 (그림자, 애니메이션, 아이콘)

**원칙**: 의심스러우면 적게 쓴다. 다음 빨간 테스트가 진짜 필요한 코드를 끌어낸다.

---

## 절대 금지

- **테스트 파일 수정 금지** — `*.test.ts(x)`, `test-setup.ts` 모두 X.
  - 예외: 테스트가 명백한 오타/구문 오류로 깨질 때만 사용자에게 보고하고 멈춘다. 임의로 고치지 않는다.
- **시나리오에 없는 기능 구현 금지** — `issue-{N}.md`의 시나리오 외 동작은 추가하지 않는다.
- **테스트를 우회하는 구현 금지** — 예: `vi` 글로벌을 감지해 분기, 환경에 따라 동작 변경.
- **새 라이브러리 도입 금지** — 기존 스택만 사용. 추가가 필요해 보이면 사용자에게 묻는다.
- **design.md에 없는 시각 요소 추가 금지** — 색·간격·아이콘 임의 추가 X. 디자인 문서가 진실의 원천.

---

## 실행 순서

### 단계 1 — 현재 상태 파악

```bash
npm test
```

실패 테스트 목록과 에러 메시지를 수집한다. 통과/실패/스킵 수를 기록.

### 단계 2 — collect 실패 감지

`issue-{N}.md` 의 체크박스(`- [ ]`) 총 건수와 vitest가 보고하는 `Tests` 수를 비교한다.

| 상황 | 의미 | 대응 |
|------|------|------|
| 체크박스 수 == Tests 수 | 모든 시나리오가 등록됨 | 단계 3으로 |
| 체크박스 수 > Tests 수 | 일부 테스트 파일이 import 실패로 suite 자체가 collect 안 됨 | 시그니처만 있는 **stub 파일 생성** 후 재실행 |
| 체크박스 수 < Tests 수 | 시나리오에 없는 테스트 존재 — Red 단계에서 범위 초과 | 사용자에게 보고하고 멈춤 |

**Stub 파일이란**: 시그니처에 명시된 export만 있고 본문은 비어 있는 파일.

```ts
// src/hooks/useTagInput.ts (stub)
export function useTagInput() {
  return {} as any;
}
```

stub의 목적은 *테스트가 인식되게 하는 것뿐*이다. 동작은 단계 4에서 채운다. stub을 만든 직후 `npm test`를 다시 돌려 모든 테스트가 collect되는지 확인한다.

### 단계 3 — 디자인 컨텍스트 로드

UI 컴포넌트를 건드릴 가능성이 있으면 먼저 디자인 컨텍스트를 모은다. 백엔드/순수 로직(훅, API)만 다루는 이슈는 이 단계를 건너뛰어도 된다.

확인 순서:

1. `docs/design-system.md` 또는 `docs/design-system/` 디렉토리가 있는지 본다. 있으면 읽어 색상·간격·레이아웃·상태별 표현(hover/disabled/focus)을 파악.
2. 없으면 프로젝트에서 디자인 정보를 찾는다 — `CLAUDE.md`의 "디자인 시스템" 섹션, `tailwind.config`, 기존 컴포넌트의 스타일 패턴.
3. `docs/features/{feature}/issue-{N}.md` 에 "디자인 참고" 섹션이 있으면 함께 읽는다.
4. `CLAUDE.md` 의 스타일링 컨벤션(시맨틱 토큰, named export 등)을 확인.

> 디자인 문서가 *진실의 원천*이다. 테스트는 "태그 칩이 보인다"까지만 검증하지만, 어떻게 보일지는 디자인 문서가 정한다. 두 출처가 충돌하면 사용자에게 묻는다.

### 단계 4 — 첫 번째 실패 테스트만 통과시키기

**한 번에 하나만** 본다. 여러 개를 한꺼번에 건드리면 회귀 원인을 추적하기 어렵다.

작성 원칙:

- 테스트의 Arrange/Act/Assert 를 그대로 따라간다 — 테스트가 호출하는 함수명·파라미터·반환 모양에 정확히 맞춘다.
- 분기는 시나리오가 요구한 것만. `if`가 늘어나면 멈추고 "이 if는 어느 테스트가 요구하나?" 자문.
- UI는 디자인 스펙의 Tailwind 클래스를 그대로 적용. 마크업 구조도 디자인 문서를 따른다.
- Context 액션은 API 함수를 호출한 뒤 로컬 state를 동기 업데이트 (CLAUDE.md의 패턴).

```tsx
// 단순한 Green 예시 — NoteEditor에 태그 칩 렌더링
{selectedNote.tags?.map((tag) => (
  <span key={tag} className="px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground">
    {tag}
  </span>
))}
```

### 단계 5 — 피드백 루프

```bash
npm test
```

#### 5-a. 대상 테스트가 통과했고 회귀가 없으면

단계 6으로.

#### 5-b. 대상 테스트가 여전히 실패하면

에러 메시지를 읽고 원인을 분석한다.

| 패턴 | 원인 추정 | 다음 행동 |
|------|-----------|-----------|
| `expected X, received undefined` | 반환값/state 갱신 누락 | 해당 분기 추가 |
| `Unable to find element ...` | 렌더 분기·조건이 다름 | JSX 조건 점검 |
| `expected mock to be called with ...` | 호출 인자가 다름 | 인자 객체 모양 점검 |
| `Cannot read properties of undefined` | 옵셔널 체이닝 누락 / 초기값 누락 | 기본값/?. 추가 |

수정 후 `npm test` 재실행. **최대 5회 반복**. 5회 후에도 실패하면:

- 사용자에게 보고: 어떤 테스트가, 어떤 에러로, 어떤 시도를 했는지.
- 멈춘다. 임의로 테스트를 수정하거나 우회하지 않는다.

#### 5-c. 다른 테스트가 깨졌으면 (회귀)

방금 추가한 코드가 기존 통과 테스트를 깬 것이다. 회귀 테스트도 같은 루프(5-b)로 다룬다 — 단, **방금 변경분을 먼저 의심**한다. 흔한 원인: 공유 state 변형, 기본값 변경, 외부 호출 인자 변형.

### 단계 6 — 시나리오 체크박스 갱신

`issue-{N}.md` 에서 방금 통과시킨 시나리오 줄을 `- [ ]` → `- [x]` 로 바꾼다.

> 체크박스는 진행 상황의 단일 원천이다. 다음 사이클 시작 시점에 "어디까지 왔는지"를 보여준다.

### 단계 7 — 다음 실패 테스트로

다시 단계 4부터 반복. 모든 실패 테스트가 사라지면 단계 8로.

### 단계 8 — 커버리지 측정

```bash
npx vitest run --coverage
```

`coverage/index.html` 또는 터미널 표를 본다. 미커버 라인을 식별해:

| 미커버 유형 | 처리 |
|-------------|------|
| 시나리오에 누락된 정상 케이스 | 사용자에게 "이 분기는 어떤 시나리오로 다뤄야 하나?" 보고 |
| 시나리오에 없는 방어 코드 | 그 코드 자체가 불필요할 수 있음. 사용자와 상의 후 제거 검토 |
| 외부 의존성 (`fetch` 실패 경로 등) | 일반적으로 통합 테스트 영역 — 보고만 |

**커버리지를 올리려는 테스트 추가는 금지**한다. 시나리오에서 기인하지 않은 테스트는 사양과 분리된다. 커버리지는 *피드백 신호* 일 뿐.

### 단계 9 — 결과 요약

사용자에게 보고:

```
✓ 통과한 시나리오: N개
  ✓ <파일> > <describe> > should ... when ...
  ...
✓ 회귀 없음 (기존 M개 테스트 그대로 통과)
✓ 커버리지: Lines X% / Branches Y%
미커버 라인: <파일:줄> — 시나리오 부재 / 불필요한 방어 코드 / 통합 영역
다음 단계: Refactor (중복 제거, 명명 다듬기)
```

---

## 구현 패턴 (이 프로젝트)

CLAUDE.md 의 규칙을 따른다. 자주 등장하는 패턴:

### Hook

```ts
// src/hooks/useTagInput.ts
import { useState } from 'react';

export function useTagInput(initial: string[] = []) {
  const [tags, setTags] = useState<string[]>(initial);

  const addTag = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;          // 시나리오: whitespace 입력은 no-op
    setTags((prev) => [...prev, trimmed]);
  };

  return { tags, addTag };
}
```

분기는 시나리오가 요구하는 것만. `if (tags.includes(trimmed)) return` 같은 중복 방지는 *해당 시나리오가 있을 때만* 추가한다.

### Context 액션

```ts
// API 호출 → 성공 시 로컬 state 동기 업데이트
const createNote = async (input: { title: string; content: string; tags?: string[] }) => {
  const created = await api.createNote(input);
  setNotes((prev) => [...prev, created]);
  return created;
};
```

테스트가 `api.createNote` spy의 호출 인자를 검증하므로, 인자 객체 모양을 정확히 맞춘다. `tags`가 있으면 포함, 없으면 빼는 식의 차이가 테스트를 깬다.

### UI 컴포넌트

- named export (`export function NoteEditor`)
- Props 타입은 컴포넌트 바로 위에 인라인 정의
- 로딩/에러/빈 상태는 early return
- Tailwind 시맨틱 토큰 (`bg-card`, `text-foreground`, `text-muted-foreground`)
- 디자인 문서가 정의한 클래스를 그대로 사용

### API 함수

```ts
export async function createNote(input: { title: string; content: string; tags?: string[] }) {
  const now = new Date().toISOString();
  const res = await fetch(`${BASE_URL}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, createdAt: now, updatedAt: now }),
  });
  if (!res.ok) throw new Error('Failed to create note');
  return res.json();
}
```

`createdAt` / `updatedAt` 은 클라이언트에서 생성 (CLAUDE.md 규칙).

---

## 자주 하는 실수

- ❌ 첫 테스트가 `react` 태그를 요구한다고 `return ['react']` 같은 하드코딩 후 **다음 테스트로 가지 않고** 일반화 — 다음 빨간 테스트가 일반화를 끌어내야 한다 (단, 다음 테스트가 있으면 자연스럽게 일반화하면 된다)
- ❌ 한 번에 여러 파일을 수정하고 한꺼번에 테스트 — 회귀 원인 추적 불가
- ❌ 테스트를 통과시키기 위해 테스트를 수정 — 절대 금지
- ❌ "이 정도는 추가해도..." 하며 시나리오에 없는 검증/UI 추가 — 검증되지 않은 코드가 늘어남
- ❌ 디자인 문서를 안 보고 시맨틱 클래스만 적당히 — 색·간격이 어긋남
- ❌ 5회 시도 후에도 안 되는데 계속 시도 — 멈추고 사용자에게 보고
- ❌ 커버리지를 올리려고 테스트를 추가 — 시나리오 ↔ 테스트 ↔ 구현의 일대일 흐름이 깨짐

---

## 끝맺음

전체 통과 + 회귀 없음 + 체크박스 갱신 + 커버리지 보고가 이 스킬의 완료 상태다.

이 상태가 **Refactor 단계의 입력**이다. 중복 제거, 명명 다듬기, 추상화 도입은 그때 한다 — 모든 테스트가 안전망이 된 상태에서.
