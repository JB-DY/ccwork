# Issue #2: 칩의 × 버튼으로 태그 즉시 제거

GitHub: https://github.com/JB-DY/ccwork/issues/2

> 순수 UI 와이어링 이슈. `removeTag`는 이슈 1에서 이미 `useTagInput`에 정의·테스트됨. 본 이슈는 NoteEditor 칩에 `×` 버튼을 붙여 `removeTag`에 연결하는 것이 전부다.

---

## 시그니처

### Types / Hooks / Context / API — 변경 없음

- `Note.tags: string[]` (이슈 1 확정)
- `useTagInput`의 `removeTag: (tag: string) => void` — 정확히 일치하는 태그 1건 제거, 없으면 no-op (이슈 1 확정·테스트 완료). **소비만 하고 훅 코드는 수정하지 않는다.**
- 제거는 로컬 상태에만 반영. 서버 반영은 저장 버튼 클릭 시 기존 `updateNote(id, { title, content, tags })` 흐름으로 처리 (ADR-3.1). Context·API 시그니처 변경 없음.

### Components

```tsx
// src/components/NoteEditor.tsx — Props 인터페이스 변경 없음
interface NoteEditorProps {
  selectedNoteId: string | null;
  isCreating: boolean;
  onDone: () => void;
}
```

내부 추가 (시그니처는 아님, 참고):
- `useTagInput` 구조분해에 `removeTag` 추가: `const { tags, addTag, removeTag, reset } = useTagInput(...)`
- 각 칩(`data-testid="tag-chip"`) 내부에 제거용 `×` 버튼 추가 — `data-testid="tag-chip-remove"`
- 칩 제거 핸들러 `handleRemoveTag(tag: string)` → `removeTag(tag)` 호출 (네이밍 규칙 `handle[Action]` 준수)

### Errors / Reject 조건

| 위치 | 조건 | 동작 |
|------|------|------|
| `useTagInput.removeTag` | 일치하는 태그 없음 | no-op (throw 안 함) — 이슈 1 확정 |
| `api.updateNote` | HTTP non-2xx | 기존대로 `Error('Failed to update note')` throw |

### 패턴 일관성 체크

- [x] 내부 핸들러 `handle[Action]` 네이밍 (`handleRemoveTag`)
- [x] Context 변경 없음 — 기존 `updateNote` 흐름 재사용
- [x] `updatedAt` 타임스탬프는 클라이언트(`api/notes.ts`)에서 주입 — 기존 그대로
- [x] 새 패턴 도입 없음 — 기존 칩 렌더링 구조에 버튼만 추가

---

## 테스트 시나리오

> 본 이슈는 컴포넌트 레벨(NoteEditor) 와이어링이므로 시나리오 전부 NoteEditor 대상이다. 훅 단위 `removeTag` 동작은 이슈 1에서 이미 커버됨.

### 정상

- [x] **[정상]** `NoteEditor` — should render a remove (`×`) button inside each chip when `selectedNote.tags` is non-empty
- [x] **[정상]** `NoteEditor` — should remove the clicked chip from the rendered list when its `×` button is clicked (e.g. `['react','typescript']` → click react's × → only `typescript` chip remains)
- [x] **[정상]** `NoteEditor` — should call `updateNote(id, { title, content, tags: ['typescript'] })` when 'react' is removed from `['react','typescript']` and the note is saved
- [x] **[정상]** `NoteEditor` — should remove only the clicked chip and leave the other chips visible (no over-removal)

### 경계

- [x] **[경계]** `NoteEditor` — should render zero chips and call `updateNote` with `tags: []` when the only remaining chip is removed and saved
- [x] **[경계]** `NoteEditor` — should not trigger a save (no `updateNote` call) when a chip's `×` is clicked but the save button is not pressed

### 예외

- [x] **[예외]** `NoteEditor` — should restore the removed chip from server state when the note is re-selected without saving (reset on `selectedNoteId` change — 저장 전 제거는 서버에 반영되지 않음)
- [x] **[예외]** `NoteEditor` — clicking a chip's `×` button should not submit/save (the click is isolated to local state, save still requires the save button)

---

## AC ↔ 시나리오 매핑

| AC | 내용 | 커버 시나리오 |
|----|------|--------------|
| AC1 | 칩 제거 후 저장 → 서버에 제거 반영, 재선택 시 미표시 | `[정상] remove clicked chip from list` / `[정상] updateNote called with ['typescript']` / `[정상] render × button per chip` |
| AC2 | 저장 전 제거는 서버에 반영되지 않음 (재선택 시 복원) | `[예외] restore removed chip on re-select without saving` / `[경계] no updateNote call when × clicked without save` |

> 두 AC 모두 최소 1개 시나리오로 커버됨. 빈 칸 없음.
