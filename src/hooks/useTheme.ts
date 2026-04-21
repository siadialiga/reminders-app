import { useEffect, useState } from 'react';
import { useApp } from '../store/AppContext';
import { getSystemTheme, getAutoTheme } from '../utils';

type ResolvedTheme = 'light' | 'dark';

function applyThemeClass(resolved: ResolvedTheme) {
  const root = document.documentElement;
  if (resolved === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export function useTheme() {
  const { state } = useApp();
  const theme = state.settings.theme ?? 'system';
  // Guard against old persisted data that may have these fields undefined
  const autoThemeDayStart = (state.settings as any).autoThemeDayStart ?? 7;
  const autoThemeNightStart = (state.settings as any).autoThemeNightStart ?? 19;

  const resolve = (): ResolvedTheme => {
    if (theme === 'light') return 'light';
    if (theme === 'dark') return 'dark';
    if (theme === 'system') return getSystemTheme();
    // auto: based on time
    return getAutoTheme(autoThemeDayStart, autoThemeNightStart);
  };

  const [resolved, setResolved] = useState<ResolvedTheme>(resolve);

  useEffect(() => {
    const next = resolve();
    setResolved(next);
    applyThemeClass(next); // apply immediately when theme setting changes

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => {
        const t = mq.matches ? 'dark' : 'light';
        setResolved(t);
        applyThemeClass(t);
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }

    if (theme === 'auto') {
      const interval = setInterval(() => {
        const t = getAutoTheme(autoThemeDayStart, autoThemeNightStart);
        setResolved(t);
        applyThemeClass(t);
      }, 60_000);
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, autoThemeDayStart, autoThemeNightStart]);

  useEffect(() => {
    applyThemeClass(resolved);
  }, [resolved]);

  return { resolved, mode: theme };
}
