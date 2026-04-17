import { invoke } from '@tauri-apps/api/core';
import { useCallback, useEffect, useState } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoke<string[]>('get_favorites')
      .then((favs) => {
        setFavorites(favs);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load favorites', err);
        setLoading(false);
      });
  }, []);

  const toggleFavorite = useCallback(async (id: string, isCurrentlyFavorite: boolean) => {
    // Optimistic update
    setFavorites((prev) => {
      if (isCurrentlyFavorite) {
        return prev.filter((fid) => fid !== id);
      } else {
        if (!prev.includes(id)) {
          return [...prev, id];
        }
        return prev;
      }
    });

    try {
      await invoke('toggle_favorite', {
        id,
        isFavorite: !isCurrentlyFavorite,
      });
    } catch (err) {
      console.error('Failed to toggle favorite', err);
      // Rollback on fail
      setFavorites((prev) => {
        if (!isCurrentlyFavorite) {
          return prev.filter((fid) => fid !== id);
        } else {
          if (!prev.includes(id)) {
            return [...prev, id];
          }
          return prev;
        }
      });
    }
  }, []);

  return { favorites, toggleFavorite, loading };
}
