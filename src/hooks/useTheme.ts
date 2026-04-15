import { useEffect, useState } from 'react';
import { useApp } from '../store/AppContext';
import { getSystemTheme, getAutoTheme } from '../utils';

type ResolvedTheme = 'light' | 'dark';

export function useTheme() {
  const { state } = useApp();
  const { theme, autoThemeDayStart, autoThemeNightStart } = state.settings;

  const resolve = (): ResolvedTheme => {
    if (theme === 'light') return 'light';
    if (theme === 'dark') return 'dark';
    if (theme === 'system') return getSystemTheme();
    // auto: based on time
    return getAutoTheme(autoThemeDayStart, autoThemeNightStart);
  };

  const [resolved, setResolved] = useState<ResolvedTheme>(resolve);

  useEffect(() => {
    setResolved(resolve());

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => setResolved(mq.matches ? 'dark' : 'light');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }

    if (theme === 'auto') {
      // Poll every minute for auto-theme time changes
      const interval = setInterval(() => {
        setResolved(getAutoTheme(autoThemeDayStart, autoThemeNightStart));
      }, 60_000);
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, autoThemeDayStart, autoThemeNightStart]);

  useEffect(() => {
    const root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [resolved]);

  return { resolved, mode: theme };
}
