import { invoke } from '@tauri-apps/api/core';
import { open as pickFolder } from '@tauri-apps/plugin-dialog';
import { useCallback, useEffect, useState } from 'react';

export function useDbPath() {
  const [dbPath, setDbPath] = useState<string>('');
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the current path once on mount
  useEffect(() => {
    invoke<string>('get_db_path')
      .then(setDbPath)
      .catch((e) => setError(String(e)));
  }, []);

  /**
   * Opens the native OS folder-picker (via @tauri-apps/plugin-dialog),
   * passes the selected directory to the Rust `pick_db_location` command,
   * and updates the displayed path.
   *
   * Call this only on desktop — the button is hidden on mobile via usePlatform.
   */
  const changeLocation = useCallback(async () => {
    setError(null);
    setChanging(true);
    try {
      // Use the JS dialog API to open the folder picker
      const selected = await pickFolder({ directory: true, multiple: false });
      if (!selected) return; // user cancelled

      // Tell Rust to copy the DB to the selected folder and swap the connection
      const newPath = await invoke<string>('pick_db_location');
      setDbPath(newPath);
    } catch (e) {
      setError(String(e));
    } finally {
      setChanging(false);
    }
  }, []);

  return { dbPath, changing, changeLocation, error };
}
