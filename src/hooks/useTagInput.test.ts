import { renderHook, act } from '@testing-library/react';
import { useTagInput } from './useTagInput';

describe('useTagInput', () => {
  describe('initial state', () => {
    it('should start with empty array when `initial` is omitted', () => {
      const { result } = renderHook(() => useTagInput());
      expect(result.current.tags).toEqual([]);
    });

    it('should start with provided tags when `initial` is given', () => {
      const { result } = renderHook(() => useTagInput(['react', 'ts']));
      expect(result.current.tags).toEqual(['react', 'ts']);
    });

    it('should treat empty array `[]` as a valid `initial` value (tags becomes `[]`, not undefined)', () => {
      const { result } = renderHook(() => useTagInput([]));
      expect(result.current.tags).toEqual([]);
    });
  });

  describe('addTag', () => {
    it('should append trimmed tag to list when input is a valid non-empty string', () => {
      const { result } = renderHook(() => useTagInput());
      act(() => result.current.addTag('react'));
      expect(result.current.tags).toEqual(['react']);
    });

    it('should append to existing tags preserving insertion order when list already has items', () => {
      const { result } = renderHook(() => useTagInput(['react']));
      act(() => result.current.addTag('typescript'));
      expect(result.current.tags).toEqual(['react', 'typescript']);
    });

    it('should strip leading and trailing whitespace before appending (e.g. `"  react  "` → `"react"`)', () => {
      const { result } = renderHook(() => useTagInput());
      act(() => result.current.addTag('  react  '));
      expect(result.current.tags).toEqual(['react']);
    });

    it('should be no-op (tags unchanged) when input is empty string `""`', () => {
      const { result } = renderHook(() => useTagInput(['existing']));
      act(() => result.current.addTag(''));
      expect(result.current.tags).toEqual(['existing']);
    });

    it('should be no-op (tags unchanged) when input is whitespace only (`"   "`)', () => {
      const { result } = renderHook(() => useTagInput(['existing']));
      act(() => result.current.addTag('   '));
      expect(result.current.tags).toEqual(['existing']);
    });
  });

  describe('removeTag', () => {
    it('should remove exact-match tag from list when the tag is present', () => {
      const { result } = renderHook(() => useTagInput(['react', 'typescript']));
      act(() => result.current.removeTag('react'));
      expect(result.current.tags).toEqual(['typescript']);
    });

    it('should be no-op when the given tag does not exist in the list', () => {
      const { result } = renderHook(() => useTagInput(['react']));
      act(() => result.current.removeTag('vue'));
      expect(result.current.tags).toEqual(['react']);
    });
  });

  describe('reset', () => {
    it('should replace current tags with the given initial array', () => {
      const { result } = renderHook(() => useTagInput(['react']));
      act(() => result.current.reset(['vue', 'svelte']));
      expect(result.current.tags).toEqual(['vue', 'svelte']);
    });
  });
});
