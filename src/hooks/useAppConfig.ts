import { invoke } from '@tauri-apps/api/core';
import { useCallback, useEffect, useState } from 'react';
import type { AppConfig } from '../types/config';

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    invoke<AppConfig>('get_config')
      .then((c) => setConfig(c))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateConfig = useCallback(async (newConfig: AppConfig) => {
    setSaving(true);
    try {
      await invoke('set_config', { config: newConfig });
      setConfig(newConfig);
    } catch (err) {
      console.error('Save config error:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return { config, loading, saving, updateConfig };
}
