# Issue #1: 노트 태그 데이터 모델 추가 및 입력/저장/표시 MVP

GitHub: https://github.com/JB-DY/ccwork/issues/1

---

## 시그니처

### Types

```ts
// src/types/note.ts
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[]; // 신규 — 빈 배열이면 태그 없음
}
```

### Hooks

```ts
// src/hooks/useTagInput.ts
interface UseTagInputReturn {
  tags: string[];
  addTag: (input: string) => void;   // trim 후 빈 문자열이면 no-op (이슈 1 범위: trim 검증만)
  removeTag: (tag: string) => void;  // 정확히 일치하는 태그 1건 제거 (없으면 no-op)
  reset: (initial: string[]) => void;
}

export function useTagInput(initial?: string[]): UseTagInputReturn;
// initial 미지정 시 빈 배열로 시작
```

> 이슈 1 범위에서 `addTag` 내부 검증은 **trim 후 빈 문자열 no-op**만 포함. 중복(이슈 3) / 10개 제한(이슈 4) / 20자 제한(이슈 5)은 후속 이슈에서 추가.

### API (변경 없음)

`src/api/notes.ts`의 `createNote` / `updateNote`는 이미 `Omit<Note, 'id'|'createdAt'|'updatedAt'>` / `Partial<Note>`를 받으므로 `Note.tags` 추가만으로 자동 확장. **별도 시그니처 변경 없음.**

### Context

```ts
// src/context/NotesContext.tsx
interface NotesContextType {
  notes: Note[];
  loading: boolean;
  error: string | null;
  createNote: (title: string, content: string, tags: string[]) => Promise<void>; // tags 파라미터 추가
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;              // 변경 없음 — Partial<Note>가 tags 자동 포함
  deleteNote: (id: string) => Promise<void>;
}
```

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
- `useTagInput(selectedNote?.tags ?? [])` 호출
- 태그 입력 `<input>` + Enter 핸들러 `handleTagKeyDown`
- 칩 목록(읽기 전용, × 버튼은 이슈 2)
- `selectedNoteId` 변경 시 `reset(selectedNote.tags ?? [])`
- `handleSave`에서 `createNote(title, content, tags)` / `updateNote(id, { title, content, tags })`

### Errors / Reject 조건

| 위치 | 조건 | 동작 |
|------|------|------|
| `useTagInput.addTag` | `input.trim() === ''` | no-op (throw 안 함) |
| `useTagInput.removeTag` | 일치하는 태그 없음 | no-op (throw 안 함) |
| `api.createNote` / `api.updateNote` | HTTP non-2xx | 기존대로 `Error('Failed to create note')` / `Error('Failed to update note')` throw |

---

## 테스트 시나리오

### 정상

- [x] **[정상]** `useTagInput` — should start with empty array when `initial` is omitted
- [x] **[정상]** `useTagInput` — should start with provided tags when `initial` is given
- [x] **[정상]** `useTagInput.addTag` — should append trimmed tag to list when input is a valid non-empty string
- [x] **[정상]** `useTagInput.addTag` — should append to existing tags preserving insertion order when list already has items
- [x] **[정상]** `useTagInput.removeTag` — should remove exact-match tag from list when the tag is present
- [x] **[정상]** `useTagInput.reset` — should replace current tags with the given initial array
- [x] **[정상]** `NotesContext.createNote` — should call `api.createNote` with `{ title, content, tags }` when invoked with tags
- [x] **[정상]** `NotesContext.updateNote` — should forward `tags` field to `api.updateNote` when included in `updates`
- [x] **[정상]** `NoteEditor` — should render one chip per tag when `selectedNote.tags` is non-empty
- [x] **[정상]** `NoteEditor` — should invoke `addTag` with current input value and clear the input when Enter is pressed in tag field
- [x] **[정상]** `NoteEditor` — should invoke `reset(selectedNote.tags)` when `selectedNoteId` changes
- [x] **[정상]** `NoteEditor` — should call `createNote(title, content, tags)` when saving a new note
- [x] **[정상]** `NoteEditor` — should call `updateNote` with merged tags `['react', 'typescript']` when adding `'typescript'` to an existing note that already has `tags: ['react']` and saving

### 경계

- [x] **[경계]** `useTagInput` — should treat empty array `[]` as a valid `initial` value (tags becomes `[]`, not undefined)
- [x] **[경계]** `useTagInput.addTag` — should strip leading and trailing whitespace before appending (e.g. `"  react  "` → `"react"`)
- [x] **[경계]** `NoteEditor` — should render zero chips when `selectedNote.tags` is `[]`
- [x] **[경계]** `NoteEditor` (note switch) — should fully replace previous note's tags so none of A's tags remain visible when switching from note A to note B

### 예외

- [x] **[예외]** `useTagInput.addTag` — should be no-op (tags unchanged) when input is empty string `""`
- [x] **[예외]** `useTagInput.addTag` — should be no-op (tags unchanged) when input is whitespace only (`"   "`)
- [x] **[예외]** `NoteEditor` — should render zero chips AND clear the tag input value to `""` when whitespace-only string `"   "` is entered and Enter is pressed
- [x] **[예외]** `useTagInput.removeTag` — should be no-op when the given tag does not exist in the list
- [x] **[예외]** `NotesContext.createNote` — should propagate `Error("Failed to create note")` when `api.createNote` rejects
- [x] **[예외]** `NotesContext.updateNote` — should propagate `Error("Failed to update note")` when `api.updateNote` rejects

---

## AC ↔ 시나리오 매핑

| AC | 내용 | 커버 시나리오 |
|----|------|--------------|
| AC1 | 태그 추가 후 저장 → 재선택 시 칩 표시 | `[정상] useTagInput.addTag — append trimmed tag` / `[정상] NoteEditor — Enter로 addTag 호출` / `[정상] NotesContext.createNote — title/content/tags 전송` / `[정상] NoteEditor — render one chip per tag` |
| AC2 | 공백 전용 입력 무시 | `[예외] addTag — no-op when whitespace only` / `[예외] addTag — no-op when empty string` / `[예외] NoteEditor — zero chips + input cleared on whitespace-only Enter` |
| AC3 | 노트 선택 변경 시 태그 상태 초기화 | `[정상] NoteEditor — reset(selectedNote.tags) on selectedNoteId change` / `[경계] NoteEditor — fully replace previous note's tags on switch` |
| AC4 | 기존 태그가 있는 노트에 새 태그 추가 | `[정상] addTag — append preserving insertion order` / `[정상] NoteEditor — render one chip per tag` / `[정상] NoteEditor — updateNote called with merged ['react','typescript']` |

> 모든 AC가 최소 1개 시나리오로 커버됨. 빈 칸 없음.
