---
name: tdd-red
description: 승인된 테스트 시나리오(`docs/features/{feature}/issue-{N}.md`)를 실패하는 Vitest 테스트 코드로 옮기는 TDD Red 단계 스킬. `/tdd-red <이슈번호>` 호출이나 사용자가 "Red 단계 시작", "실패 테스트 작성", "test 코드 짜줘", "Red 들어가자", "tdd-red 1" 같이 말할 때 반드시 사용한다. 이 스킬은 테스트 파일만 생성/수정하며 `src/`의 구현 코드는 절대 손대지 않는다 — 통과시키지 않고 의도적으로 실패시키는 게 목적이다.
context: fork
---

# TDD Red Skill

승인된 시나리오를 **실패하는 테스트 코드**로 옮긴다. TDD 사이클의 첫 단계.

근거: 시나리오/시그니처가 `docs/features/{feature}/issue-{N}.md` 상하단에 이미 확정되어 있다 (test-scenarios 스킬 산출물).

---

## 입출력 계약

### 입력
- `$ARGUMENTS` — 이슈 번호 (예: `1`)
- `docs/features/{feature}/issue-{N}.md` — 시그니처 + 시나리오 + AC 매핑
  - `{feature}` 폴더는 현재 작업 컨텍스트(브랜치, 최근 작업)로 식별. 모호하면 사용자에게 묻는다.

### 산출물
- 테스트 대상과 같은 디렉토리에 `*.test.ts` / `*.test.tsx` 파일
- 모든 테스트가 **빨갛게 실패하는 상태**

---

## TDD Red 단계의 본질

> **"지금 통과하면 잘못된 것이다."**

Red 단계는 "구현이 없는데도 통과한다 = 테스트가 가짜다" 를 잡아내는 안전망이다. 테스트는 시그니처를 호출하고 기대값을 단언하되, 구현이 없거나 비어 있으므로 **반드시 실패**한다.

### 좋은 실패의 모양

| 종류 | 메시지 예 | 의미 |
|------|-----------|------|
| 모듈/심볼 없음 | `Cannot find module '../hooks/useTagInput'` | 파일/export 자체가 없음 — 가장 깨끗한 Red |
| 함수 호출 결과 미정의 | `expected 'react', received undefined` | 시그니처는 있지만 구현 미완 |
| 컴포넌트 미렌더 | `Unable to find element by ...` | UI 와이어링 전 |
| 컨텍스트 액션 미동작 | `expected api.createNote to have been called` | 액션이 mock을 호출하지 않음 |

### 나쁜 실패 (피해야 함)

- `SyntaxError` — 테스트 코드 오타. 의도된 실패가 아님.
- 잘못된 import 경로 때문에 발생하는 실패. 의도된 실패가 아님.
- `TypeError: Cannot read properties of undefined` 가 mock 설정 오류 때문일 때.

**가짜 Red를 피하는 법**: 한 시나리오를 작성하고 *즉시* 단일 파일을 실행해 어떤 에러로 실패하는지 확인한다. 메시지가 "기대한 의도된 실패"가 아니면 멈추고 정리한다.

---

## 절대 금지

- **`src/` 안의 비-테스트 파일 수정 금지** — `*.ts` / `*.tsx` 구현체, `db.json`, `types/*.ts` 모두 X.
  - 예외: 시그니처 단계에서 이미 확정한 타입이 아직 코드에 없어 import 자체가 안 되면, 사용자에게 알리고 멈춘다. 임의로 타입을 만들지 않는다.
- **테스트를 통과시키기 위한 임시 구현 금지** — Red의 핵심은 "구현 없음"이다.
- **`expect.assertions(0)`, `it.skip`, `it.todo` 같은 회피 금지** — 실패해야 한다.
- **새 테스트 라이브러리/유틸 도입 금지** — 기존 스택(Vitest, @testing-library/react, jsdom)만 사용.

---

## 사전 확인 (시작 전 한 번)

코드베이스가 다음을 만족하는지 빠르게 확인:

- `package.json`에 `vitest` + `@testing-library/react` + `@testing-library/jest-dom` 존재
- `vite.config.ts`에 `test` 블록 (`globals: true`, `environment: 'jsdom'`, `setupFiles: ['./src/test-setup.ts']`)
- `src/test-setup.ts`에서 `@testing-library/jest-dom` import

`globals: true` 덕분에 `describe` / `it` / `expect` 는 **import 없이 사용한다**. (혼선이 잦은 부분)

---

## 실행 순서

### 단계 1 — `issue-{N}.md` 읽기

`docs/features/{feature}/issue-{N}.md` 에서:
- **시그니처** (상단) — 어떤 함수/훅/컴포넌트를 호출할지, 파라미터/반환 타입은 무엇인지
- **시나리오** (하단) — 정상/경계/예외 각 항목
- **AC ↔ 시나리오 매핑** — 시나리오가 어떤 AC를 충족하는지

> 시나리오 문장의 **"should ... when ..."** 부분이 그대로 `it()` 제목이 된다. 변형하지 않는다.

### 단계 2 — 테스트 파일 매핑

시나리오의 **대상명**을 보고 어느 파일에 테스트를 쓸지 정한다.

| 대상명 패턴 | 테스트 파일 |
|-------------|-------------|
| `useTagInput(.foo)` | `src/hooks/useTagInput.test.ts` |
| `NotesContext.createNote` | `src/context/NotesContext.test.tsx` |
| `NoteEditor` | `src/components/NoteEditor.test.tsx` |
| `createNote` (api 레이어) | `src/api/notes.test.ts` |

규칙:
- **위치**: 테스트 대상 파일과 **같은 디렉토리**
- **이름**: `{원본파일명}.test.ts` 또는 `.test.tsx` (JSX 사용 시 `.tsx`)
- **describe 블록**: 함수/훅/컴포넌트 단위로 묶는다. 한 파일에 여러 describe 가능.

```ts
// src/hooks/useTagInput.test.ts
import { renderHook, act } from '@testing-library/react';
import { useTagInput } from './useTagInput';

describe('useTagInput', () => {
  describe('addTag', () => {
    it('should append trimmed tag to list when input is a valid non-empty string', () => {
      // ...
    });
  });

  describe('removeTag', () => {
    // ...
  });
});
```

### 단계 3 — 한 번에 한 시나리오: 작성 → 실행 → 실패 확인

루프를 짧게 돌린다.

#### 3-1. 한 시나리오를 `it()` 한 블록으로 작성

- 제목은 시나리오의 `should ... when ...` 부분을 **그대로** 적는다.
- 본문은 **Arrange → Act → Assert** 3단으로.
- 비동기는 `async` + `await` + `findBy*` 활용.

```ts
it('should append trimmed tag to list when input is a valid non-empty string', () => {
  // Arrange
  const { result } = renderHook(() => useTagInput());
  // Act
  act(() => result.current.addTag('  react  '));
  // Assert
  expect(result.current.tags).toEqual(['react']);
});
```

#### 3-2. 즉시 해당 파일만 실행

```bash
npx vitest run <테스트파일경로>
```

#### 3-3. 실패 메시지 확인

- "좋은 실패" 표의 한 줄에 해당하는가? → 다음 시나리오로 이동
- "나쁜 실패"인가? → 멈추고 테스트 코드 정리

> 한 시나리오씩 굳히면, 마지막에 한꺼번에 30개가 빨갛게 깨지는 상황을 피할 수 있다. 첫 시나리오에서 잘못 잡은 import/mocking 패턴이 30번 복제되는 일을 막는다.

### 단계 4 — 전체 실행으로 마무리 검증

모든 시나리오를 옮긴 뒤:

```bash
npm test
```

#### 기대 결과

- **모든 신규 테스트 실패** — 의도된 실패
- 실패 카운트 = 시나리오 카운트
- Skip / Todo / Passed 가 신규 테스트 중에 없음

테스트가 하나라도 통과하면:
- 그 테스트가 정말 구현 없이도 통과하는가? (예: `expect(true).toBe(true)` 같은 빈 단언) → 단언을 의미 있게 고친다.
- 혹은 우연히 mock이 반환값을 채워주고 있는가? → mock 정리.

---

## 시나리오 → 테스트 변환 가이드

### 정상 (Happy Path)

호출하고 결과를 비교한다.

```ts
// [정상] useTagInput.addTag — should append trimmed tag to list when input is a valid non-empty string
it('should append trimmed tag to list when input is a valid non-empty string', () => {
  const { result } = renderHook(() => useTagInput());
  act(() => result.current.addTag('react'));
  expect(result.current.tags).toEqual(['react']);
});
```

### 경계 (Boundary)

임계값에서 "정확히 N일 때"와 "N+1일 때"를 짝으로 작성하면 효과적이다 (이슈 1엔 N개 제한이 없으니 trim 같은 케이스가 경계).

```ts
// [경계] useTagInput.addTag — should strip leading and trailing whitespace before appending
it('should strip leading and trailing whitespace before appending', () => {
  const { result } = renderHook(() => useTagInput());
  act(() => result.current.addTag('  react  '));
  expect(result.current.tags).toEqual(['react']);
});
```

### 예외 (Error / No-op)

- **No-op**: 상태가 변하지 않았음을 단언 (`toEqual([])`, `toBe(prevTags)`)
- **Throw**: `await expect(fn()).rejects.toThrow('...')`

```ts
// [예외] useTagInput.addTag — should be no-op when input is whitespace only
it('should be no-op when input is whitespace only', () => {
  const { result } = renderHook(() => useTagInput(['existing']));
  act(() => result.current.addTag('   '));
  expect(result.current.tags).toEqual(['existing']);
});

// [예외] NotesContext.createNote — should propagate Error("Failed to create note") when api.createNote rejects
it('should propagate Error("Failed to create note") when api.createNote rejects', async () => {
  vi.spyOn(api, 'createNote').mockRejectedValueOnce(new Error('Failed to create note'));
  // ... render provider, get action ...
  await expect(action()).rejects.toThrow('Failed to create note');
});
```

---

## 자주 하는 실수

- ❌ `import { describe, it, expect } from 'vitest'` — `globals: true` 설정에서 불필요, 혼란만 가중
- ❌ Red 단계에서 함수가 "안 보여서" `vi.fn()` 으로 가짜를 만들어 통과시킴 → 실패해야 한다
- ❌ 시나리오 문장을 의역해 `it()` 제목을 바꿈 → 추적성이 깨짐. 그대로 쓴다
- ❌ `it.todo('...')` 로 메모만 남김 → Red가 아님. 실제로 `it()`를 쓰고 실패시킨다
- ❌ 한 시나리오 작성 후 실행하지 않고 다음으로 → 잘못된 패턴이 전체에 복제됨
- ❌ 시나리오에 없는 케이스를 추가 → 범위 초과. 필요하면 issue-N.md를 먼저 갱신

---

## 끝맺음

전체 `npm test` 실행 결과를 사용자에게 보고한다.

```
✗ <파일> > <describe> > should ... when ...   FAIL: <에러 한 줄>
✗ ...
Total: N failed, 0 passed
```

이 상태가 다음 단계(Green)의 입력이다. 사용자 또는 Green 스킬이 이어받아 **가장 단순한 구현**으로 하나씩 통과시킨다.
