import { invoke } from '@tauri-apps/api/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Poem, Tag } from '../types/poem';

const ALL_TAG = 'الكل';

// ─── Rust ↔ TS bridge type ───────────────────────────────────────────────────
// Matches the Rust `Poem` struct field names (snake_case).
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

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePoemVault() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [activeTag, setActiveTag] = useState<Tag>(ALL_TAG);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // ── Derived ──────────────────────────────────────────────────────────────

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

  // ── Mutations ─────────────────────────────────────────────────────────────

  const addPoem = useCallback(async (data: Omit<Poem, 'id'>) => {
    const poem: RustPoem = {
      id: crypto.randomUUID(),
      ...data,
      updated_at: nowMs(),
      deleted_at: null,
    };
    // Optimistic update
    setPoems((prev) => [toPoem(poem), ...prev]);
    // Persist locally
    await invoke('save_poem', { poem }).catch(console.error);
    // Background cloud push (fire-and-forget)
    invoke('sync_now').catch(console.warn);
  }, []);

  const updatePoem = useCallback(async (id: string, data: Omit<Poem, 'id'>) => {
    const poem: RustPoem = {
      id,
      ...data,
      updated_at: nowMs(),
      deleted_at: null,
    };
    // Optimistic update
    setPoems((prev) => prev.map((p) => (p.id === id ? toPoem(poem) : p)));
    await invoke('save_poem', { poem }).catch(console.error);
    invoke('sync_now').catch(console.warn);
  }, []);

  const deletePoem = useCallback(async (id: string) => {
    // Optimistic removal
    setPoems((prev) => prev.filter((p) => p.id !== id));
    await invoke('delete_poem', { id }).catch(console.error);
    syncNow().catch(console.warn);
  }, []);

  const syncNow = useCallback(async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      const config = await invoke<import('../types/config').AppConfig>('get_config');
      
      // 1. Try Local Hub Sync if configured (primary for peers)
      if (config.local_hub_ip) {
        await invoke('sync_local_hub');
      }

      // 2. Try Supabase Sync if Master or specifically enabled
      if (config.supabase_url && config.supabase_anon_key) {
        await invoke('sync_supabase');
      }

      const raw = await invoke<RustPoem[]>('get_poems');
      setPoems(raw.map(toPoem));
    } catch (err) {
      console.warn('Sync error:', err);
      setSyncError(String(err));
    } finally {
      setSyncing(false);
    }
  }, []);

  // ── Sync on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    invoke<RustPoem[]>('get_poems')
      .then((raw) => setPoems(raw.map(toPoem)))
      .catch((err) => console.error('DB load error:', err));

    syncNow().catch(() => {});
  }, [syncNow]);

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
    syncNow,
    syncing,
    syncError,
    stats,
  };
}
