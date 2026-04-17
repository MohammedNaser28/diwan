import { createContext, useContext, useCallback, useEffect, useMemo, useState, ReactNode } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { Poem, Tag } from '../types/poem';

const ALL_TAG = 'الكل';

interface RustPoem {
  id: string;
  text: string;
  poet: string;
  source: string;
  tags: string[];
  updated_at: number;
  deleted_at: number | null;
}

function toPoem(r: RustPoem): Poem {
  return { id: r.id, text: r.text, poet: r.poet, source: r.source, tags: r.tags };
}

function nowMs(): number {
  return Date.now();
}

interface PoemVaultContextType {
  poems: Poem[];
  filteredPoems: Poem[];
  allTags: Tag[];
  activeTag: Tag;
  setActiveTag: (tag: Tag) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  addPoem: (data: Omit<Poem, 'id'>) => Promise<void>;
  updatePoem: (id: string, data: Omit<Poem, 'id'>) => Promise<void>;
  deletePoem: (id: string) => Promise<void>;
  syncNow: () => Promise<void>;
  deduplicate: () => Promise<number>;
  syncing: boolean;
  syncError: string | null;
  stats: {
    poemCount: number;
    poetCount: number;
    sourceCount: number;
    tagCount: number;
  };
}

const PoemVaultContext = createContext<PoemVaultContextType | undefined>(undefined);

export function PoemVaultProvider({ children }: { children: ReactNode }) {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [activeTag, setActiveTag] = useState<Tag>(ALL_TAG);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const fetchPoems = useCallback(async () => {
    try {
      const raw = await invoke<RustPoem[]>('get_poems');
      setPoems(raw.map(toPoem));
    } catch (err) {
      console.error('DB load error:', err);
    }
  }, []);

  const syncNow = useCallback(async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      const config = await invoke<import('../types/config').AppConfig>('get_config');
      
      // 1. Try Local Hub Sync
      if (config.local_hub_ip) {
        await invoke('sync_local_hub');
      }

      // 2. Try Supabase Sync
      if (config.supabase_url && config.supabase_anon_key && 
          config.supabase_url.trim() !== '' && config.supabase_anon_key.trim() !== '') {
        await invoke('sync_supabase');
      }

      await fetchPoems();
    } catch (err) {
      console.warn('Sync error:', err);
      setSyncError(String(err));
    } finally {
      setSyncing(false);
    }
  }, [fetchPoems]);

  const deduplicate = useCallback(async () => {
    setSyncing(true);
    try {
      const removed = await invoke<number>('deduplicate_poems');
      await fetchPoems();
      return removed;
    } finally {
      setSyncing(false);
    }
  }, [fetchPoems]);

  const addPoem = useCallback(async (data: Omit<Poem, 'id'>) => {
    const poem: RustPoem = {
      id: crypto.randomUUID(),
      ...data,
      updated_at: nowMs(),
      deleted_at: null,
    };
    setPoems((prev) => [toPoem(poem), ...prev]);
    await invoke('save_poem', { poem }).catch(console.error);
    invoke('sync_now').catch(console.warn); // Background sync
  }, []);

  const updatePoem = useCallback(async (id: string, data: Omit<Poem, 'id'>) => {
    const poem: RustPoem = {
      id,
      ...data,
      updated_at: nowMs(),
      deleted_at: null,
    };
    setPoems((prev) => prev.map((p) => (p.id === id ? toPoem(poem) : p)));
    await invoke('save_poem', { poem }).catch(console.error);
    invoke('sync_now').catch(console.warn);
  }, []);

  const deletePoem = useCallback(async (id: string) => {
    setPoems((prev) => prev.filter((p) => p.id !== id));
    await invoke('delete_poem', { id }).catch(console.error);
    syncNow().catch(console.warn);
  }, [syncNow]);

  useEffect(() => {
    fetchPoems();
    syncNow().catch(() => {});
  }, [fetchPoems, syncNow]);

  const allTags = useMemo<Tag[]>(() => {
    const tagSet = new Set<Tag>();
    poems.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
    return [ALL_TAG, ...Array.from(tagSet)];
  }, [poems]);

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

  const stats = useMemo(() => {
    const poets = new Set(poems.map((p) => p.poet).filter(Boolean));
    const sources = new Set(poems.map((p) => p.source).filter(Boolean));
    const tags = new Set(poems.flatMap((p) => p.tags));
    return {
      poemCount: poems.length,
      poetCount: poets.size,
      sourceCount: sources.size,
      tagCount: tags.size,
    };
  }, [poems]);

  const value = {
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
    syncNow,
    deduplicate,
    syncing,
    syncError,
    stats,
  };

  return <PoemVaultContext.Provider value={value}>{children}</PoemVaultContext.Provider>;
}

export function usePoemVaultContext() {
  const context = useContext(PoemVaultContext);
  if (context === undefined) {
    throw new Error('usePoemVaultContext must be used within a PoemVaultProvider');
  }
  return context;
}
