---
name: test-scenarios
description: GitHub 이슈 한 건을 받아 (1) 함수/컴포넌트 시그니처를 확정하고 (2) 그 시그니처를 기반으로 테스트 시나리오를 도출하는 TDD 사전 단계 스킬. `/test-scenarios <이슈번호>` 형태로 호출되거나, 사용자가 "시그니처 확정", "테스트 시나리오 만들어줘", "TDD 시작 전 시나리오 정리", "issue-N.md 만들어줘" 같은 말을 할 때 반드시 사용한다. 이 스킬은 구현 코드도, 테스트 코드도 작성하지 않는다 — 오직 시그니처와 시나리오 문서만 만든다.
context: fork
---

# Test Scenarios Skill

GitHub 이슈 → 시그니처 확정 → 테스트 시나리오 도출까지의 파이프라인.
다음 단계인 TDD(Red→Green→Refactor)의 입력이 되는 **계약 문서**를 만든다.

---

## 입출력 계약

### 입력
- `$ARGUMENTS` — GitHub 이슈 번호 (예: `1`, `2`)
- `docs/features/{feature}/prd.md` — 해당 feature의 PRD (ADR 포함)
- 코드베이스 — 기존 시그니처/패턴 참조

### 산출물
- `docs/features/{feature}/issue-{N}.md`
  - 상단: 확정된 시그니처
  - 하단: 도출된 테스트 시나리오 (정상/경계/예외 분류)

> `{feature}` 디렉토리는 현재 작업 컨텍스트(브랜치명, 최근 PRD 위치 등)에서 식별한다. 모호하면 사용자에게 묻는다.

---

## 절대 금지

- **구현 코드 작성 금지** — 함수 본문, 컴포넌트 JSX, 훅 내부 로직 모두 X
- **테스트 코드 작성 금지** — `describe`/`it`/`expect` 일체 작성 X
- **새 패턴 도입 금지** — 기존 `src/api/notes.ts`, `src/context/NotesContext.tsx`, `src/components/*` 패턴을 그대로 따른다

이 스킬은 "무엇을(WHAT)"만 정한다. "어떻게(HOW)"는 다음 단계(TDD)에서 작성한다.

---

## 전체 흐름

```
GitHub Issue #N
    ↓ 단계 1 — 시그니처 확정 (이슈 + PRD + 코드베이스)
시그니처 초안
    ↓ [GATE 1] 개발자 승인
    ↓ 단계 2 — issue-{N}.md 상단에 시그니처 기록
    ↓ 단계 3 — 시그니처 기반 시나리오 도출
시나리오 초안
    ↓ 단계 4 — issue-{N}.md 하단에 시나리오 추가
    ↓ 단계 5 — AC 대조 (gh issue view)
    ↓ [GATE 2] 개발자 승인
완료 → TDD 단계로 인계
```

게이트가 두 곳이다. 게이트를 넘기 전에는 다음 단계 작업을 하지 않는다.

---

## 단계 1: 시그니처 확정

### 활동

1. `gh issue view $ARGUMENTS` 로 이슈 본문 + AC를 읽는다.
2. `docs/features/{feature}/prd.md` 에서 관련 ADR과 사용자 스토리를 확인한다.
3. 코드베이스에서 **유사한 기존 시그니처**를 찾는다.
   - API 함수: `src/api/notes.ts`
   - Context 액션: `src/context/NotesContext.tsx`
   - 컴포넌트 Props: `src/components/*.tsx`
   - 커스텀 훅: `src/hooks/*.ts` (있다면)

### 확정할 항목

| 범주 | 내용 |
|------|------|
| 함수 시그니처 | 이름, 파라미터 타입, 반환 타입 |
| 에러 케이스 | 어떤 입력/상태에서 throw 하거나 거부하는가 |
| Context 액션 시그니처 | `useNotes()` 가 노출할 새 액션 |
| 컴포넌트 Props | 인터페이스 이름은 `[Component]Props`, 컴포넌트 바로 위에 인라인 정의 |
| 훅 반환 모양 | 객체 구조 (예: `{ tags, addTag, removeTag, reset }`) |

### 작성 형식 (예시)

```ts
// src/hooks/useTagInput.ts
interface UseTagInputReturn {
  tags: string[];
  addTag: (input: string) => void;   // trim 후 빈 문자열이면 no-op
  removeTag: (tag: string) => void;
  reset: (initial: string[]) => void;
}

export function useTagInput(initial?: string[]): UseTagInputReturn;
```

```ts
// src/types/note.ts
export interface Note {
  // ... 기존 필드
  tags: string[];
}
```

> 타입만 적는다. 함수 본문(`{...}`)은 적지 않는다.

### 패턴 일관성 체크리스트

- [ ] API 함수는 실패 시 `Error` throw (네이밍: `Failed to <verb>`)
- [ ] Context 액션 동사는 `create` / `update` / `delete` 통일
- [ ] 컴포넌트 콜백 prop 네이밍: `on[Action]`
- [ ] 컴포넌트 내부 핸들러: `handle[Action]`
- [ ] `createdAt` / `updatedAt` 타임스탬프는 클라이언트에서 주입 (서버 X)

### [GATE 1] 시그니처 승인

개발자에게 시그니처 전체를 보여주고 명시적 승인을 받는다.

```
[GATE 1] 시그니처를 확인해주세요. 승인하시면 issue-{N}.md에 기록하고 시나리오 도출로 넘어갑니다.
```

승인 전까지 단계 2 이후로 진행하지 않는다.

---

## 단계 2: issue-{N}.md 상단에 시그니처 기록

승인된 시그니처를 `docs/features/{feature}/issue-{N}.md`의 **상단**에 기록한다.

### 파일 템플릿

```markdown
# Issue #{N}: {이슈 제목}

GitHub: https://github.com/{owner}/{repo}/issues/{N}

## 시그니처

### Types
... (타입 정의)

### Functions / Hooks
... (함수/훅 시그니처)

### Components
... (컴포넌트 Props 인터페이스)

### Errors
... (throw 조건 또는 거부 조건)

<!-- 시나리오는 단계 4에서 하단에 추가됨 -->
```

---

## 단계 3: 시나리오 도출

### 분류 기준

| 분류 | 의미 | 예 |
|------|------|-----|
| **정상** | 의도된 입력으로 의도된 결과 | "유효한 태그를 추가하면 목록에 들어간다" |
| **경계** | 한도/임계값 직전·정확히·직후 | "10개 도달 시 11번째는 거부", "20자 정확히 입력은 허용" |
| **예외** | 잘못된 입력 / 비정상 상태 | "빈 문자열 입력은 무시", "중복 입력은 거부" |

### 시나리오 형식 (필수)

```
[정상|경계|예외] {대상명} — should {기대동작} when {조건}
```

**예시**

- `[정상] useTagInput.addTag — should append trimmed tag to list when valid input`
- `[경계] useTagInput.addTag — should reject 11th tag when list length is exactly 10`
- `[예외] useTagInput.addTag — should be no-op when input is whitespace only`
- `[정상] NoteEditor — should render chip per tag when note has non-empty tags`
- `[예외] createNote — should throw "Failed to create note" when server returns non-2xx`

### 도출 절차

각 시그니처 항목마다:

1. **정상 경로 1~2개** — happy path
2. **경계 케이스** — 한도/길이/0개/1개/N개 같은 임계값
3. **예외 케이스** — 빈 값, 공백, 중복, 비정상 상태, 네트워크 실패 등

> 한 시그니처에서 정상/경계/예외 중 어느 하나도 떠오르지 않으면 그 시그니처가 충분히 정의되지 않은 것이다 — 단계 1로 돌아간다.

---

## 단계 4: issue-{N}.md 하단에 시나리오 추가

`docs/features/{feature}/issue-{N}.md` 하단에 다음 형식으로 추가:

```markdown
## 테스트 시나리오

### 정상
- [정상] ... — should ... when ...
- [정상] ... — should ... when ...

### 경계
- [경계] ... — should ... when ...

### 예외
- [예외] ... — should ... when ...
```

---

## 단계 5: AC 대조 (커버리지 검증)

`gh issue view $ARGUMENTS` 로 이슈의 **Acceptance Criteria** 항목을 다시 읽는다.

### 매핑 표 작성

각 AC가 어느 시나리오로 커버되는지 표로 정리한다:

```markdown
## AC ↔ 시나리오 매핑

| AC | 커버 시나리오 |
|----|--------------|
| AC1: Enter로 태그 추가 | [정상] useTagInput.addTag — should append ... |
| AC2: 공백만 입력 시 무시 | [예외] useTagInput.addTag — should be no-op when whitespace ... |
| AC3: ... | [경계] ... |
```

### 규칙

- **AC 한 줄은 최소 1개의 시나리오로 커버되어야 한다.**
- 빈 칸이 있으면 해당 AC에 대응하는 시나리오를 즉시 추가한다.
- 시나리오는 있으나 AC가 없다 = 그 시나리오는 범위 초과 가능성. 다시 점검.

---

## [GATE 2] 시나리오 승인

개발자에게 시나리오 전체 + AC 매핑 표를 보여주고 명시적 승인을 받는다.

```
[GATE 2] 시나리오를 확인해주세요. 승인하시면 TDD 단계로 넘어갈 준비가 완료됩니다.
```

승인 전까지 어떤 테스트 코드/구현 코드도 작성하지 않는다.

---

## 승인 게이트 요약

| 지점 | 게이트 | 확인 내용 |
|------|--------|-----------|
| 단계 1 후 | `[GATE 1]` | 시그니처 — 타입, 에러 조건, 기존 패턴 일치 |
| 단계 5 후 | `[GATE 2]` | 시나리오 — 정상/경계/예외 분류, AC 100% 커버 |

게이트가 없으면 AI가 임의로 시나리오를 늘리거나 구현으로 넘어가버린다. 게이트마다 사용자 응답을 받는다.

---

## 자주 하는 실수

- ❌ 시그니처 단계에서 함수 본문을 작성한다 → 타입만 적는다
- ❌ 시나리오 단계에서 `describe`/`it`을 쓴다 → 자연어 문장만 쓴다
- ❌ AC에 없는 시나리오를 추가한다 → 범위 초과. 필요하면 AC를 먼저 갱신
- ❌ "에러를 적절히 처리한다" 같은 모호한 시나리오 → `[예외] X — should throw "..." when ...` 처럼 구체화
- ❌ 게이트를 건너뛰고 단계 5까지 한 번에 진행 → 각 게이트에서 멈춘다
