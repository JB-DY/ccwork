---
name: tdd-refactor
description: 전체 테스트가 통과하는 상태를 **유지하면서** 이번 이슈에서 변경된 `src/` 코드의 구조를 개선하는 TDD Refactor 단계 스킬. `/tdd-refactor <이슈번호>` 호출이나 사용자가 "Refactor 단계 시작", "리팩토링하자", "코드 정리해줘", "tdd-refactor 1", "Green 끝났으니 다듬자" 같이 말할 때 반드시 사용한다. 이 스킬은 **테스트 파일을 절대 수정하지 않으며**, 변경 범위를 이번 이슈의 diff 안으로 엄격히 제한한다 — 동작은 그대로 두고 형태만 바꾸는 게 목적이다.
context: fork
---

# TDD Refactor Skill

전체 테스트가 통과하는 상태에서 **이번 이슈가 건드린 `src/` 파일들**의 구조를 개선한다. TDD 사이클의 세 번째 단계.

근거: Green이 끝나면 테스트는 안전망이 된다. 이 안전망 위에서만 구조 개선이 안전하다. 안전망 없이 손대면 "리팩토링이 회귀를 낳는다".

---

## 입출력 계약

### 입력
- `$ARGUMENTS` — 이슈 번호 (예: `1`)
- 현재 브랜치의 변경분 — `git diff main...HEAD --name-only -- src/` 로 추출되는 파일들
- `CLAUDE.md` — 프로젝트 컨벤션(네이밍·패턴·스타일링)의 1차 출처

### 산출물
- 동일한 동작·동일한 테스트 통과를 유지한 채 **형태가 개선된** `src/` 파일
- 리팩토링 전후 요약 (무엇이, 왜, 어떻게 바뀌었나)

---

## TDD Refactor 단계의 본질

> **"동작은 그대로, 형태만 바꾼다."**

Refactor는 *형태*를 다듬는 단계다. *기능*을 추가하거나 *행동*을 바꾸면 그 순간 Refactor가 아니라 새 이슈다. 외부에서 본 행동이 바뀌지 않았는지의 단일 척도는 **테스트가 그대로 모두 초록**인지다. 매 변경마다 그 척도를 확인하기 때문에 한 사이클이 짧고 안전하다.

### 좋은 Refactor의 모양

| 종류 | 예시 | 효과 |
|------|------|------|
| 중복 제거 | 세 컴포넌트가 같은 칩 마크업을 복사 → 한 컴포넌트로 추출 | DRY, 변경점 단일화 |
| 이름 명확화 | `handleX` → `handleSaveNote` | 의도가 코드에서 읽힘 |
| 책임 분리 | `NoteEditor`가 폼+태그 입력+저장을 다 처리 → 태그 입력만 별도 컴포넌트로 | 단일 책임 |
| 매직 넘버 제거 | `if (tags.length > 10)` → `MAX_TAGS = 10` 상수 | 의미가 드러남 |
| 조건 단순화 | 중첩 if → early return | 흐름이 평탄 |
| 컨벤션 정렬 | `export default X` → named export (CLAUDE.md 규칙) | 일관성 |

### 나쁜 Refactor (피해야 함)

- 테스트가 검증하지 않는 동작을 *함께* 바꿈 — 행동 변경은 새 이슈로
- "더 유연하게"를 명분으로 옵션·파라미터 추가 — Green의 "최소 구현" 원칙을 무너뜨림
- 코드 스타일에만 매달려 의미 없는 줄바꿈/공백 변경 — 리뷰 노이즈
- 큰 추상화를 한 번에 도입 — 한 변경에 여러 문제 섞이면 회귀 원인 추적 불가
- 이슈 diff 밖의 파일을 "겸사겸사" 손댐 — 변경 범위가 흐려져 PR 검토가 어려워짐

**원칙**: 한 번에 하나, 작은 단위로. 매 단계 테스트가 초록임을 확인.

---

## 절대 금지

- **테스트 파일 수정 금지** — `*.test.ts(x)`, `test-setup.ts` 모두 X.
  - 예외: 테스트가 명백한 오타/구문 오류면 사용자에게 보고하고 멈춘다. 임의로 고치지 않는다.
- **새 기능 / 새 동작 추가 금지** — 옵션 파라미터, 분기, 검증 모두 X. 필요해 보이면 새 이슈를 제안한다.
- **src/ 디렉토리 밖 수정 금지** — `db.json`, `vite.config.ts`, `package.json` 등 X.
- **이번 이슈 diff 범위 밖 파일 수정 금지** — `git diff main...HEAD --name-only -- src/` 결과로 좁힌다. 다른 파일에서 동일한 냄새를 발견해도 별도 이슈로 분리.
- **테스트가 깨진 상태에서 다음 변경으로 진행 금지** — 빨갛게 되면 그 자리에서 롤백.
- **여러 변경을 묶어서 한 번에 테스트 금지** — 회귀 원인 추적 불가.

---

## 실행 순서

### 단계 1 — CLAUDE.md 읽기

`CLAUDE.md` 의 다음 영역을 우선 확인:
- 네이밍 컨벤션 (`handle[Action]` / `on[Action]`, Context 액션 동사 등)
- 컴포넌트 패턴 (named export, props 인라인 정의, early return 등)
- 상태 관리 패턴 (3계층 분리, Context 액션에서 로컬 state 동기 업데이트 등)
- 스타일링 컨벤션 (시맨틱 토큰, 색상·여백 스케일)
- "발견된 불일치" 같은 알려진 안티패턴

이 컨벤션이 *기준*이다. 한 코드가 컨벤션을 어기는지가 판단의 출발점.

### 단계 2 — 출발선 확인

```bash
npm test
```

**모두 통과**해야만 시작할 수 있다. 빨간 테스트가 있으면:
- 그건 Green 단계의 미완 상태 — Refactor가 아니라 Green으로 돌아간다.
- 사용자에게 보고하고 멈춘다.

### 단계 3 — 변경 파일 식별

```bash
git diff main...HEAD --name-only -- src/
```

결과에서:
- `*.test.ts` / `*.test.tsx` 제외 (테스트는 안전망이지 대상이 아님)
- 남은 파일이 **이번 사이클의 후보 집합**

각 파일을 다음 5개 점검 기준으로 빠르게 훑는다:

| 기준 | 무엇을 보나 | 흔한 신호 |
|------|-------------|-----------|
| 중복 제거 | 같은 로직/마크업/문자열이 2회 이상 등장 | 복사·붙여넣기, 비슷한 유틸 함수 두 개 |
| 네이밍 명확성 | 이름만으로 의도가 읽히는가 | `handleX`, `temp`, `data`, 약어 |
| 단일 책임 | 한 함수/컴포넌트가 여러 관심사를 섞고 있는가 | 함수가 너무 길다(>40~60줄), 무관한 분기가 한 곳에 |
| 불필요한 복잡도 | 매직 넘버, 중첩 if, 사용처 없는 옵션, 과한 추상화 | `if (x > 10)`, depth 3+ 중첩, "혹시 필요할까봐" 만든 헬퍼 |
| 컨벤션 불일치 | CLAUDE.md 규칙과 어긋남 | `export default`, 빠진 early return, hard-coded 색상값 |

> 점검 기준은 *체크리스트*가 아니라 *렌즈*다. 각 파일에 모든 기준을 강제로 적용할 필요 없음. 보이는 것만 잡는다.

### 단계 4 — 리팩토링 후보 보고 → 승인 대기

발견된 항목을 다음 형식으로 정리해 사용자에게 보고한다:

```
## 리팩토링 후보 (이슈 N)

대상 파일: <git diff 결과로 좁힌 파일 목록>

### 후보 1 — [중복 제거] src/components/NoteEditor.tsx:103-111
- 현재: 칩 렌더 마크업이 NoteEditor에 인라인
- 제안: TagChip 컴포넌트로 추출 (후속 이슈에서 × 버튼 추가 시 단일 변경점)
- 영향 범위: NoteEditor.tsx만

### 후보 2 — [네이밍] src/hooks/useTagInput.ts:13 `raw` 파라미터
- 현재: `addTag(raw: string)`
- 제안: `addTag(input: string)` — 시그니처 문서와 통일
- 영향 범위: useTagInput.ts만 (외부 호출은 인자 이름 무관)

...
```

사용자 승인 없이 진행하지 않는다. 승인된 후보만 단계 5로 가져간다.

> 보고가 잘 짜이려면 *영향 범위*를 명시해야 한다. "이 변경이 어디까지 닿나"가 리스크 평가의 핵심이다.

### 단계 5 — 한 번에 하나만, 매번 테스트

승인된 후보를 위에서부터 하나씩 처리:

1. 변경 적용
2. `npm test` 실행
3. **전체 통과** → 다음 후보로
4. **하나라도 실패** → 단계 6 (롤백)

원칙:
- **한 후보 = 한 git 커밋 단위로 생각하라.** 여러 후보를 묶어서 진행하지 않는다.
- 큰 추출(extract)이라도 *동작 보존* 단위로 쪼갠다. 예: 컴포넌트 추출 = "1) 내부 함수로 분리 → npm test → 2) 별도 파일로 이동 → npm test"

### 단계 6 — 롤백 → 다른 접근

테스트가 깨지면:
1. **즉시 롤백** (`git checkout -- <파일>` 또는 편집 되돌리기)
2. `npm test` 다시 돌려 원상복구 확인
3. 실패 메시지를 읽어 원인을 분석
4. 같은 의도를 더 작은 단위로 쪼개거나, 다른 패턴으로 시도
5. 두 번 시도해도 안 되면 그 후보는 **포기**하고 사용자에게 보고

> 회귀를 만들어낸 리팩토링은 가치가 없다. 같은 효과를 위해 항상 다른 길이 있다 — 더 작은 단위, 다른 패턴, 또는 "이번엔 안 한다"는 선택.

### 단계 7 — 변경 요약 보고

전체가 끝나면 사용자에게:

```
## Refactor 완료 (이슈 N)

### 적용된 변경
1. [중복 제거] NoteEditor.tsx — TagChip 컴포넌트 추출 (src/components/TagChip.tsx 신규)
2. [네이밍] useTagInput.ts — `raw` → `input` 파라미터명 정렬
...

### 포기한 후보
- [단일 책임] NoteEditor handleSave 분리 — 분리 후 act() 경고가 추가로 발생해 롤백. 후속 이슈 권장.

### 테스트 상태
- 전체 23개 통과, 회귀 없음
- 커버리지: 변동 없음 (또는 ±X%)
```

이 요약이 PR 설명과 다음 사이클의 출발점이 된다.

---

## 자주 등장하는 패턴 (이 프로젝트)

### 컴포넌트 추출

```tsx
// before — NoteEditor.tsx 인라인
{tags.map((tag) => (
  <span key={tag} className="px-3 py-1 rounded-full bg-[#dbe4e7] text-[#586064] ...">
    {tag}
  </span>
))}

// after — TagChip 컴포넌트
// src/components/TagChip.tsx
export function TagChip({ label }: { label: string }) {
  return (
    <span className="px-3 py-1 rounded-full bg-[#dbe4e7] text-[#586064] ...">
      {label}
    </span>
  );
}

// NoteEditor.tsx
{tags.map((tag) => <TagChip key={tag} label={tag} />)}
```

체크: named export, props 인라인 타입, Tailwind 클래스 그대로 — 디자인 토큰 자체는 건드리지 않음.

### 매직 넘버 → 상수

```ts
// before
if (tags.length >= 10) return;

// after
const MAX_TAGS_PER_NOTE = 10;
if (tags.length >= MAX_TAGS_PER_NOTE) return;
```

이슈 1엔 10개 제한이 없지만, 후속 이슈에서 도입된 매직 넘버를 정리할 때의 패턴.

### Early return으로 중첩 평탄화

```ts
// before
if (selectedNote) {
  if (selectedNote.tags) {
    return selectedNote.tags.map(...);
  }
}

// after
if (!selectedNote) return null;
if (!selectedNote.tags) return null;
return selectedNote.tags.map(...);
```

CLAUDE.md의 "로딩/에러/빈 상태는 early return" 패턴 정렬.

### 네이밍 정렬

| before | after | 이유 |
|--------|-------|------|
| `handleX` | `handleSaveNote` | 무엇을 처리하는지 |
| `onAction` (Props 콜백이 아닌 일반 함수) | `handleAction` | CLAUDE.md의 콜백 vs 핸들러 구분 |
| `data`, `temp`, `result` | `notes`, `createdNote`, `mergedTags` | 의미 |

---

## 자주 하는 실수

- ❌ "겸사겸사" 이슈 diff 밖 파일 수정 — 범위가 흐려져 리뷰가 폭발
- ❌ 한 커밋에 여러 후보를 묶어 진행 — 회귀 시 원인을 못 찾음
- ❌ 추출 후 새 옵션·파라미터 노출 — Refactor가 아닌 새 API 추가
- ❌ "테스트가 우연히 통과한다"고 단정 — 매번 `npm test` 전체 실행 (단일 파일만 돌리지 말 것)
- ❌ 테스트가 깨진 채 "잠깐만 더 고치면..." — 깨진 순간 롤백이 원칙
- ❌ 매직 넘버 상수화하면서 *값을 함께 바꿈* — 형태 변경이 아닌 동작 변경
- ❌ 컨벤션이 모호한 영역에서 임의 결정 — `CLAUDE.md` 갱신을 먼저 사용자에게 제안
- ❌ 커버리지를 끌어올리려고 리팩토링 — Refactor의 목적이 아님

---

## 끝맺음

전체 테스트 초록 + 변경 요약 보고가 완료 상태다.

이 상태가 **다음 사이클의 출발점**이다. 다음 이슈가 들어오면 깔끔해진 코드 위에서 다시 Red → Green → Refactor 가 돈다. 누적된 작은 정리들이 코드베이스의 *복리*다.
