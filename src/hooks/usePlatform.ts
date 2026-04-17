import { platform } from '@tauri-apps/plugin-os';
import { useEffect, useState } from 'react';



interface PlatformInfo {
  platform: string | null;
  isDesktop: boolean;
  isMobile: boolean;
  isAndroid: boolean;
  isIos: boolean;
  ready: boolean;
}

const INITIAL: PlatformInfo = {
  platform: null,
  isDesktop: false,
  isMobile: false,
  isAndroid: false,
  isIos: false,
  ready: false,
};

export function usePlatform(): PlatformInfo {
  const [info, setInfo] = useState<PlatformInfo>(INITIAL);

  useEffect(() => {
    // platform() is synchronous in @tauri-apps/plugin-os v2
    try {
      const p = platform() as string;
      const isAndroid = p === 'android';
      const isIos = p === 'ios';
      const isMobile = isAndroid || isIos;
      setInfo({
        platform: p,
        isDesktop: !isMobile,
        isMobile,
        isAndroid,
        isIos,
        ready: true,
      });
    } catch {
      // Fallback: assume desktop if the plugin isn't available (e.g. Vite dev mode)
      setInfo({ platform: 'linux', isDesktop: true, isMobile: false, isAndroid: false, isIos: false, ready: true });
    }
  }, []);

  return info;
}
