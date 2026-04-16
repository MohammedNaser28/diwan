import { useMemo, useState } from 'react';
import type { Poem, Tag } from '../types/poem';
import { SEED_POEMS } from '../data/seed';

const ALL_TAG = 'الكل';

export function usePoemVault() {
  const [poems, setPoems] = useState<Poem[]>(SEED_POEMS);
  const [activeTag, setActiveTag] = useState<Tag>(ALL_TAG);
  const [searchQuery, setSearchQuery] = useState('');

  /** All unique tags derived from current poems, prefixed with "الكل" */
  const allTags = useMemo<Tag[]>(() => {
    const tagSet = new Set<Tag>();
    poems.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
    return [ALL_TAG, ...Array.from(tagSet)];
  }, [poems]);

  /** Poems after applying tag filter + search query */
  const filteredPoems = useMemo<Poem[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    return poems.filter((p) => {
      const matchesTag = activeTag === ALL_TAG || p.tags.includes(activeTag);
      const matchesSearch =
        !q ||
        p.text.toLowerCase().includes(q) ||
        p.poet.toLowerCase().includes(q) ||
        p.source.toLowerCase().includes(q);
      return matchesTag && matchesSearch;
    });
  }, [poems, activeTag, searchQuery]);

  function addPoem(data: Omit<Poem, 'id'>) {
    setPoems((prev) => [...prev, { id: crypto.randomUUID(), ...data }]);
  }

  function updatePoem(id: string, data: Omit<Poem, 'id'>) {
    setPoems((prev) =>
      prev.map((p) => (p.id === id ? { id, ...data } : p)),
    );
  }

  function deletePoem(id: string) {
    setPoems((prev) => prev.filter((p) => p.id !== id));
  }

  return {
    poems,
    filteredPoems,
    allTags,
    activeTag,
    setActiveTag,
    searchQuery,
    setSearchQuery,
    addPoem,
    updatePoem,
    deletePoem,
  };
}
