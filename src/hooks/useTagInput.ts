import { useState } from 'react';

interface UseTagInputReturn {
  tags: string[];
  addTag: (input: string) => void;
  removeTag: (tag: string) => void;
  reset: (initial: string[]) => void;
}

export function useTagInput(initial: string[] = []): UseTagInputReturn {
  const [tags, setTags] = useState<string[]>(initial);

  const addTag = (input: string) => {
    const trimmed = input.trim();
    if (trimmed === '') return;
    setTags((prev) => [...prev, trimmed]);
  };

  const removeTag = (tag: string) => {
    setTags((prev) => {
      const index = prev.indexOf(tag);
      if (index === -1) return prev;
      return [...prev.slice(0, index), ...prev.slice(index + 1)];
    });
  };

  const reset = (next: string[]) => {
    setTags(next);
  };

  return { tags, addTag, removeTag, reset };
}
