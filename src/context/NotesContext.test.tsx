import { ReactNode } from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import { NotesProvider, useNotes } from './NotesContext';
import * as api from '../api/notes';

vi.mock('../api/notes');

const wrapper = ({ children }: { children: ReactNode }) => (
  <NotesProvider>{children}</NotesProvider>
);

async function renderUseNotes() {
  vi.mocked(api.fetchNotes).mockResolvedValue([]);
  const { result } = renderHook(() => useNotes(), { wrapper });
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
}

describe('NotesContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createNote', () => {
    it('should call `api.createNote` with `{ title, content, tags }` when invoked with tags', async () => {
      const result = await renderUseNotes();
      vi.mocked(api.createNote).mockResolvedValue({
        id: '1',
        title: 't',
        content: 'c',
        tags: ['react', 'ts'],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      });

      await act(async () => {
        await result.current.createNote('t', 'c', ['react', 'ts']);
      });

      expect(api.createNote).toHaveBeenCalledWith({
        title: 't',
        content: 'c',
        tags: ['react', 'ts'],
      });
    });

    it('should propagate `Error("Failed to create note")` when `api.createNote` rejects', async () => {
      const result = await renderUseNotes();
      vi.mocked(api.createNote).mockRejectedValueOnce(new Error('Failed to create note'));

      await expect(result.current.createNote('t', 'c', [])).rejects.toThrow(
        'Failed to create note',
      );
    });
  });

  describe('updateNote', () => {
    it('should forward `tags` field to `api.updateNote` when included in `updates`', async () => {
      const result = await renderUseNotes();
      vi.mocked(api.updateNote).mockResolvedValue({
        id: '1',
        title: 't',
        content: 'c',
        tags: ['vue'],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      });

      await act(async () => {
        await result.current.updateNote('1', { tags: ['vue'] });
      });

      expect(api.updateNote).toHaveBeenCalledWith('1', { tags: ['vue'] });
    });

    it('should propagate `Error("Failed to update note")` when `api.updateNote` rejects', async () => {
      const result = await renderUseNotes();
      vi.mocked(api.updateNote).mockRejectedValueOnce(new Error('Failed to update note'));

      await expect(result.current.updateNote('1', { tags: ['vue'] })).rejects.toThrow(
        'Failed to update note',
      );
    });
  });
});
