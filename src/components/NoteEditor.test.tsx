import { ReactNode } from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
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
});
