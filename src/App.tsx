import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { useTheme } from './hooks/useTheme';
import { useNotifications } from './hooks/useNotifications';
import { useTranslation, initLanguage } from './i18n';
import { Onboarding } from './components/Onboarding';
import { Sidebar } from './components/layout/Sidebar';
import { MainArea } from './components/layout/MainArea';
import { SettingsModal } from './components/layout/SettingsModal';
import { TitleBar } from './components/layout/TitleBar';
import { UpdateBanner } from './components/layout/UpdateBanner';
import { TutorialOverlay } from './components/ui/TutorialOverlay';

// ─── Inner App (inside context) ──────────────────────────────────────────────

function AppInner() {
  useTheme(); // applies theme class to <html>
  useNotifications(); // background notification polling

  const { state } = useApp();
  const { onboardingDone, settings } = state;
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Disable browser context menu globally
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // Sync i18n language with state
  useEffect(() => {
    initLanguage(settings.language as 'tr' | 'en');
  }, [settings.language]);

  const hour = new Date().getHours();
  const greetingKey =
    hour < 12 ? 'greeting_morning' : hour < 17 ? 'greeting_afternoon' : hour < 21 ? 'greeting_evening' : 'greeting_night';

  if (!onboardingDone) {
    return <Onboarding />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-[#1C1C1E] dark:bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] dark:from-[#2C2C2E] dark:via-[#1C1C1E] dark:to-[#1C1C1E] text-gray-900 dark:text-gray-100 transition-colors duration-300 rounded-lg">
      {/* Update banner */}
      <UpdateBanner />

      {/* Title bar with window controls */}
      <TitleBar>
        <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-200">
          {t('appName')}
        </span>
        <span className="text-[13px] text-gray-400 dark:text-gray-500 mx-1">—</span>
        <span className="text-[13px] text-gray-400 dark:text-gray-500 truncate">
          {t(greetingKey as any)}, {settings.userName || t('user_default')}
        </span>
      </TitleBar>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onSettingsOpen={() => setSettingsOpen(true)} />
        <MainArea />
      </div>

      <TutorialOverlay />

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
