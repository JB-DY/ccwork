import { ReactNode } from 'react';
import { render, screen, waitFor, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { NotesProvider } from '../context/NotesContext';
import { NoteEditor } from './NoteEditor';
import * as api from '../api/notes';
import type { Note } from '../types/note';

vi.mock('../api/notes');

const noteA: Note = {
  id: 'a',
  title: 'Note A',
  content: 'content A',
  tags: ['react', 'typescript'],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const noteB: Note = {
  id: 'b',
  title: 'Note B',
  content: 'content B',
  tags: ['vue'],
  createdAt: '2026-01-02T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
};

const noteEmpty: Note = {
  id: 'c',
  title: 'Empty',
  content: '',
  tags: [],
  createdAt: '2026-01-03T00:00:00Z',
  updatedAt: '2026-01-03T00:00:00Z',
};

function renderEditor(
  initialNotes: Note[],
  props: { selectedNoteId: string | null; isCreating: boolean; onDone?: () => void },
) {
  vi.mocked(api.fetchNotes).mockResolvedValue(initialNotes);
  const onDone = props.onDone ?? vi.fn();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NotesProvider>{children}</NotesProvider>
  );
  return render(
    <NoteEditor
      selectedNoteId={props.selectedNoteId}
      isCreating={props.isCreating}
      onDone={onDone}
    />,
    { wrapper },
  );
}

describe('NoteEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render one chip per tag when `selectedNote.tags` is non-empty', async () => {
    renderEditor([noteA], { selectedNoteId: 'a', isCreating: false });

    await waitFor(() => {
      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('typescript')).toBeInTheDocument();
    });
  });

  it('should render zero chips when `selectedNote.tags` is `[]`', async () => {
    renderEditor([noteEmpty], { selectedNoteId: 'c', isCreating: false });

    // 폼 동기화 후 확인 — title이 그려지면 selectedNote가 로드된 상태
    await screen.findByDisplayValue('Empty');

    // tags 칩이 하나도 없어야 한다
    expect(screen.queryByTestId('tag-chip')).not.toBeInTheDocument();
  });

  it('should invoke `addTag` with current input value and clear the input when Enter is pressed in tag field', async () => {
    const user = userEvent.setup();
    renderEditor([noteEmpty], { selectedNoteId: 'c', isCreating: false });

    await screen.findByDisplayValue('Empty');

    const tagInput = screen.getByPlaceholderText(/태그/) as HTMLInputElement;
    await user.type(tagInput, 'react');
    await user.keyboard('{Enter}');

    // addTag 결과: 칩 렌더 + 입력 비워짐
    expect(await screen.findByText('react')).toBeInTheDocument();
    expect(tagInput.value).toBe('');
  });

  it('should invoke `reset(selectedNote.tags)` when `selectedNoteId` changes', async () => {
    const { rerender } = renderEditor([noteA, noteB], {
      selectedNoteId: 'a',
      isCreating: false,
    });

    // 처음에 noteA 태그가 보여야 함
    await waitFor(() => {
      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('typescript')).toBeInTheDocument();
    });

    // noteB로 전환
    rerender(<NoteEditor selectedNoteId="b" isCreating={false} onDone={vi.fn()} />);

    // noteB의 태그만 보여야 함 (= reset 호출됨)
    await waitFor(() => {
      expect(screen.getByText('vue')).toBeInTheDocument();
    });
  });

  it("should fully replace previous note's tags so none of A's tags remain visible when switching from note A to note B", async () => {
    const { rerender } = renderEditor([noteA, noteB], {
      selectedNoteId: 'a',
      isCreating: false,
    });

    await waitFor(() => {
      expect(screen.getByText('react')).toBeInTheDocument();
    });

    rerender(<NoteEditor selectedNoteId="b" isCreating={false} onDone={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('vue')).toBeInTheDocument();
    });

    // A의 태그는 더 이상 보이면 안 됨
    expect(screen.queryByText('react')).not.toBeInTheDocument();
    expect(screen.queryByText('typescript')).not.toBeInTheDocument();
  });

  it('should call `createNote(title, content, tags)` when saving a new note', async () => {
    const user = userEvent.setup();
    vi.mocked(api.createNote).mockResolvedValue({
      id: 'new',
      title: 'New',
      content: '',
      tags: ['react'],
      createdAt: '2026-01-04T00:00:00Z',
      updatedAt: '2026-01-04T00:00:00Z',
    });

    renderEditor([], { selectedNoteId: null, isCreating: true });

    // 빈 상태로 입력 가능해야 함
    const titleInput = await screen.findByPlaceholderText('제목');
    await user.type(titleInput, 'New');

    const tagInput = screen.getByPlaceholderText(/태그/) as HTMLInputElement;
    await user.type(tagInput, 'react');
    await user.keyboard('{Enter}');

    const saveButton = screen.getByRole('button', { name: /저장/ });
    await act(async () => {
      await user.click(saveButton);
    });

    expect(api.createNote).toHaveBeenCalledWith({
      title: 'New',
      content: '',
      tags: ['react'],
    });
  });

  it("should call `updateNote` with merged tags `['react', 'typescript']` when adding `'typescript'` to an existing note that already has `tags: ['react']` and saving", async () => {
    const user = userEvent.setup();
    const noteWithReact: Note = {
      id: 'r',
      title: 'React Note',
      content: 'body',
      tags: ['react'],
      createdAt: '2026-01-05T00:00:00Z',
      updatedAt: '2026-01-05T00:00:00Z',
    };

    vi.mocked(api.updateNote).mockResolvedValue({
      ...noteWithReact,
      tags: ['react', 'typescript'],
      updatedAt: '2026-01-06T00:00:00Z',
    });

    renderEditor([noteWithReact], { selectedNoteId: 'r', isCreating: false });

    // 기존 노트가 로드될 때까지 대기
    await screen.findByDisplayValue('React Note');
    expect(screen.getByText('react')).toBeInTheDocument();

    // 태그 입력에 'typescript' 입력 후 Enter
    const tagInput = screen.getByPlaceholderText(/태그/) as HTMLInputElement;
    await user.type(tagInput, 'typescript');
    await user.keyboard('{Enter}');

    // 저장 버튼 클릭
    const saveButton = screen.getByRole('button', { name: /저장/ });
    await act(async () => {
      await user.click(saveButton);
    });

    expect(api.updateNote).toHaveBeenCalledWith('r', {
      title: 'React Note',
      content: 'body',
      tags: ['react', 'typescript'],
    });
  });

  it('should render zero chips AND clear the tag input value to `""` when whitespace-only string `"   "` is entered and Enter is pressed', async () => {
    const user = userEvent.setup();
    renderEditor([noteEmpty], { selectedNoteId: 'c', isCreating: false });

    await screen.findByDisplayValue('Empty');

    const tagInput = screen.getByPlaceholderText(/태그/) as HTMLInputElement;
    await user.type(tagInput, '   ');
    await user.keyboard('{Enter}');

    // 칩이 하나도 생기면 안 됨 (whitespace는 no-op)
    expect(screen.queryByTestId('tag-chip')).not.toBeInTheDocument();
    // 입력은 비워져야 함
    expect(tagInput.value).toBe('');
  });

  // ── Issue #2: 칩의 × 버튼으로 태그 즉시 제거 ───────────────────────────

  it('should render a remove (`×`) button inside each chip when `selectedNote.tags` is non-empty', async () => {
    renderEditor([noteA], { selectedNoteId: 'a', isCreating: false });

    await screen.findByDisplayValue('Note A');

    const removeButtons = await screen.findAllByTestId('tag-chip-remove');
    expect(removeButtons).toHaveLength(2);
  });

  it("should remove the clicked chip from the rendered list when its `×` button is clicked (e.g. `['react','typescript']` → click react's × → only `typescript` chip remains)", async () => {
    const user = userEvent.setup();
    renderEditor([noteA], { selectedNoteId: 'a', isCreating: false });

    await screen.findByDisplayValue('Note A');
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();

    // 'react' 칩의 × 버튼 클릭
    const reactChip = screen.getByText('react').closest('[data-testid="tag-chip"]') as HTMLElement;
    const reactRemove = within(reactChip).getByTestId('tag-chip-remove');
    await user.click(reactRemove);

    // 'react' 칩은 사라지고 'typescript'만 남아야 함
    await waitFor(() => {
      expect(screen.queryByText('react')).not.toBeInTheDocument();
    });
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it("should call `updateNote(id, { title, content, tags: ['typescript'] })` when 'react' is removed from `['react','typescript']` and the note is saved", async () => {
    const user = userEvent.setup();
    vi.mocked(api.updateNote).mockResolvedValue({
      ...noteA,
      tags: ['typescript'],
      updatedAt: '2026-01-07T00:00:00Z',
    });

    renderEditor([noteA], { selectedNoteId: 'a', isCreating: false });

    await screen.findByDisplayValue('Note A');

    const reactChip = screen.getByText('react').closest('[data-testid="tag-chip"]') as HTMLElement;
    const reactRemove = within(reactChip).getByTestId('tag-chip-remove');
    await user.click(reactRemove);

    const saveButton = screen.getByRole('button', { name: /저장/ });
    await act(async () => {
      await user.click(saveButton);
    });

    expect(api.updateNote).toHaveBeenCalledWith('a', {
      title: 'Note A',
      content: 'content A',
      tags: ['typescript'],
    });
  });

  it('should remove only the clicked chip and leave the other chips visible (no over-removal)', async () => {
    const user = userEvent.setup();
    const noteThree: Note = {
      id: 't3',
      title: 'Three',
      content: 'body',
      tags: ['react', 'typescript', 'vue'],
      createdAt: '2026-01-08T00:00:00Z',
      updatedAt: '2026-01-08T00:00:00Z',
    };

    renderEditor([noteThree], { selectedNoteId: 't3', isCreating: false });

    await screen.findByDisplayValue('Three');

    const tsChip = screen
      .getByText('typescript')
      .closest('[data-testid="tag-chip"]') as HTMLElement;
    const tsRemove = within(tsChip).getByTestId('tag-chip-remove');
    await user.click(tsRemove);

    await waitFor(() => {
      expect(screen.queryByText('typescript')).not.toBeInTheDocument();
    });
    // 나머지 칩은 그대로 보여야 함
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('vue')).toBeInTheDocument();
  });

  it('should render zero chips and call `updateNote` with `tags: []` when the only remaining chip is removed and saved', async () => {
    const user = userEvent.setup();
    vi.mocked(api.updateNote).mockResolvedValue({
      ...noteB,
      tags: [],
      updatedAt: '2026-01-09T00:00:00Z',
    });

    renderEditor([noteB], { selectedNoteId: 'b', isCreating: false });

    await screen.findByDisplayValue('Note B');
    expect(screen.getByText('vue')).toBeInTheDocument();

    const vueChip = screen.getByText('vue').closest('[data-testid="tag-chip"]') as HTMLElement;
    const vueRemove = within(vueChip).getByTestId('tag-chip-remove');
    await user.click(vueRemove);

    await waitFor(() => {
      expect(screen.queryByTestId('tag-chip')).not.toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /저장/ });
    await act(async () => {
      await user.click(saveButton);
    });

    expect(api.updateNote).toHaveBeenCalledWith('b', {
      title: 'Note B',
      content: 'content B',
      tags: [],
    });
  });

  it("should not trigger a save (no `updateNote` call) when a chip's `×` is clicked but the save button is not pressed", async () => {
    const user = userEvent.setup();
    renderEditor([noteA], { selectedNoteId: 'a', isCreating: false });

    await screen.findByDisplayValue('Note A');

    const reactChip = screen.getByText('react').closest('[data-testid="tag-chip"]') as HTMLElement;
    const reactRemove = within(reactChip).getByTestId('tag-chip-remove');
    await user.click(reactRemove);

    // 저장 버튼을 누르지 않았으므로 updateNote는 호출되면 안 됨
    expect(api.updateNote).not.toHaveBeenCalled();
  });

  it('should restore the removed chip from server state when the note is re-selected without saving (reset on `selectedNoteId` change — 저장 전 제거는 서버에 반영되지 않음)', async () => {
    const user = userEvent.setup();
    const { rerender } = renderEditor([noteA, noteB], {
      selectedNoteId: 'a',
      isCreating: false,
    });

    await screen.findByDisplayValue('Note A');
    expect(screen.getByText('react')).toBeInTheDocument();

    // 'react' 제거 (저장하지 않음)
    const reactChip = screen.getByText('react').closest('[data-testid="tag-chip"]') as HTMLElement;
    const reactRemove = within(reactChip).getByTestId('tag-chip-remove');
    await user.click(reactRemove);

    await waitFor(() => {
      expect(screen.queryByText('react')).not.toBeInTheDocument();
    });

    // 다른 노트로 전환했다가 다시 noteA로 돌아옴
    rerender(<NoteEditor selectedNoteId="b" isCreating={false} onDone={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('vue')).toBeInTheDocument();
    });

    rerender(<NoteEditor selectedNoteId="a" isCreating={false} onDone={vi.fn()} />);

    // 저장하지 않았으므로 'react' 칩이 서버 상태로 복원되어야 함
    await waitFor(() => {
      expect(screen.getByText('react')).toBeInTheDocument();
    });
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it("clicking a chip's `×` button should not submit/save (the click is isolated to local state, save still requires the save button)", async () => {
    const user = userEvent.setup();
    renderEditor([noteA], { selectedNoteId: 'a', isCreating: false });

    await screen.findByDisplayValue('Note A');

    const reactChip = screen.getByText('react').closest('[data-testid="tag-chip"]') as HTMLElement;
    const reactRemove = within(reactChip).getByTestId('tag-chip-remove');
    await user.click(reactRemove);

    // 칩 제거 클릭만으로는 저장(서버 반영)이 일어나면 안 됨
    expect(api.updateNote).not.toHaveBeenCalled();
    expect(api.createNote).not.toHaveBeenCalled();
  });
});
