'use client';

import { useCallback, useMemo } from 'react';
import config from '@/configs/website-config';
import { useTheme } from 'next-themes';

export function useMetaColor() {
  const { resolvedTheme } = useTheme();
  const metaColor = useMemo(() => {
    return resolvedTheme !== 'dark' ? config.metaThemeColors.light : config.metaThemeColors.dark;
  }, [resolvedTheme]);

  const setMetaColor = useCallback((color: string) => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
  }, []);

  return { metaColor, setMetaColor };
}
