import React, { useState } from 'react';
import {
  Settings as SettingsIcon, Bell, Moon, Sun, Monitor, Clock,
  Trash2, Info, Github, Heart, Globe, RefreshCcw
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { useTranslation } from '../../i18n';
import type { ThemeMode } from '../../types';
import { cn } from '../../utils';
import { enable, disable } from '@tauri-apps/plugin-autostart';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

type TabType = 'general' | 'notifications' | 'danger' | 'about';

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { state, updateSettings, clearAllData } = useApp();
  const { settings } = state;
  const { t, changeLanguage, language } = useTranslation();
  const [tab, setTab] = useState<TabType>('general');
  const [tempName, setTempName] = useState(settings.userName);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'found' | 'none' | 'error'>('idle');

  if (!open) return null;

  const manualCheck = async () => {
    setUpdateStatus('checking');
    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const update = await check();
      if (update) {
        setUpdateStatus('found');
      } else {
        setUpdateStatus('none');
      }
    } catch (e) {
      console.error(e);
      setUpdateStatus('error');
    }
  };

  const handleNameSave = () => {
    if (tempName.trim()) updateSettings({ userName: tempName.trim() });
  };

  const handleClearAll = () => {
    clearAllData();
    onClose();
  };

  const handleLanguageChange = (lang: string) => {
    updateSettings({ language: lang });
    changeLanguage(lang as 'tr' | 'en');
  };

  const THEME_OPTIONS: { value: ThemeMode; labelKey: string; icon: React.ReactNode }[] = [
    { value: 'light', labelKey: 'theme_light', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', labelKey: 'theme_dark', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', labelKey: 'theme_system', icon: <Monitor className="w-4 h-4" /> },
    { value: 'auto', labelKey: 'theme_auto', icon: <Clock className="w-4 h-4" /> },
  ];

  const TABS = [
    { id: 'general' as const, label: t('general'), icon: SettingsIcon },
    { id: 'notifications' as const, label: t('notifications'), icon: Bell },
    { id: 'danger' as const, label: t('data'), icon: Trash2 },
    { id: 'about' as const, label: t('about'), icon: Info },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-[560px] rounded-2xl bg-white dark:bg-[#000000] shadow-2xl border border-gray-200/60 dark:border-white/10 overflow-hidden animate-in zoom-in-95 fade-in duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10 shrink-0">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">{t('settings_title')}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-lg"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-white/10 shrink-0">
          {TABS.map((tabItem) => {
            const Icon = tabItem.icon;
            return (
              <button
                key={tabItem.id}
                onClick={() => setTab(tabItem.id as TabType)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all border-b-2',
                  tab === tabItem.id
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tabItem.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* ── General Tab ── */}
          {tab === 'general' && (
            <div className="space-y-6">
              {/* Username */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  {t('username')}
                </label>
                <div className="flex gap-2">
                  <input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="flex-1 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-gray-100 outline-none focus:border-blue-400 transition-all"
                    placeholder={t('enterName')}
                  />
                  <button
                    onClick={handleNameSave}
                    className="px-3.5 py-2 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all"
                  >
                    {t('save')}
                  </button>
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  {t('language')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'en', label: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
                    { value: 'tr', label: 'Türkçe', flag: 'https://flagcdn.com/w40/tr.png' },
                  ].map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => handleLanguageChange(lang.value)}
                      className={cn(
                        'flex items-center gap-3 py-3 px-4 rounded-xl border text-sm font-medium transition-all group',
                        language === lang.value
                          ? 'border-blue-400 bg-blue-50 dark:bg-blue-500/10 text-blue-500'
                          : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20'
                      )}
                    >
                      <img 
                        src={lang.flag} 
                        alt={lang.label} 
                        className="w-5 h-3.5 object-cover rounded-sm shadow-sm group-hover:scale-110 transition-transform" 
                      />
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  {t('theme')}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {THEME_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateSettings({ theme: opt.value })}
                      className={cn(
                        'flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm font-medium transition-all',
                        settings.theme === opt.value
                          ? 'border-blue-400 bg-blue-50 dark:bg-blue-500/10 text-blue-500'
                          : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20'
                      )}
                    >
                      {opt.icon}
                      {t(opt.labelKey as any)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show completed */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {t('showCompleted')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t('showCompletedDesc')}
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateSettings({ showCompletedTasks: !settings.showCompletedTasks })
                  }
                  className={cn(
                    'relative inline-flex h-[28px] w-[50px] shrink-0 rounded-full transition-colors duration-200',
                    settings.showCompletedTasks ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow mt-[4px] transition-transform duration-200',
                      settings.showCompletedTasks ? 'translate-x-[23px]' : 'translate-x-[4px]'
                    )}
                  />
                </button>
              </div>

              {/* Auto Start */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {t('autoStart')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t('autoStartDesc')}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    const newValue = !settings.autoStart;
                    updateSettings({ autoStart: newValue });
                    if (newValue) await enable();
                    else await disable();
                  }}
                  className={cn(
                    'relative inline-flex h-[28px] w-[50px] shrink-0 rounded-full transition-colors duration-200',
                    settings.autoStart ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow mt-[4px] transition-transform duration-200',
                      settings.autoStart ? 'translate-x-[23px]' : 'translate-x-[4px]'
                    )}
                  />
                </button>
              </div>

              {/* Minimize to Tray */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {t('minimizeToTray')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t('minimizeToTrayDesc')}
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateSettings({ minimizeToTray: !settings.minimizeToTray })
                  }
                  className={cn(
                    'relative inline-flex h-[28px] w-[50px] shrink-0 rounded-full transition-colors duration-200',
                    settings.minimizeToTray ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow mt-[4px] transition-transform duration-200',
                      settings.minimizeToTray ? 'translate-x-[23px]' : 'translate-x-[4px]'
                    )}
                  />
                </button>
              </div>
            </div>
          )}

          {/* ── Notifications Tab ── */}
          {tab === 'notifications' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {t('enableNotifications')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t('enableNotificationsDesc')}
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateSettings({ notificationsEnabled: !settings.notificationsEnabled })
                  }
                  className={cn(
                    'relative inline-flex h-[28px] w-[50px] shrink-0 rounded-full transition-colors duration-200',
                    settings.notificationsEnabled ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow mt-[4px] transition-transform duration-200',
                      settings.notificationsEnabled ? 'translate-x-[23px]' : 'translate-x-[4px]'
                    )}
                  />
                </button>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {t('notificationInfo')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Danger Tab ── */}
          {tab === 'danger' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20">
                <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">
                  {t('deleteAllData')}
                </p>
                <p className="text-xs text-red-500 dark:text-red-400/80 mb-3">
                  {t('deleteAllDataDesc')}
                </p>
                {!showClearConfirm ? (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all"
                  >
                    {t('clearData')}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleClearAll}
                      className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all"
                    >
                      {t('confirmDelete')}
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-white/20 transition-all"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── About Tab ── */}
          {tab === 'about' && (
            <div className="space-y-6 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Reminders</h3>
                <p className="text-sm text-gray-500">{t('version')} 0.1.0 (Stable)</p>
              </div>

              <button
                onClick={manualCheck}
                disabled={updateStatus === 'checking'}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm",
                  updateStatus === 'found' 
                    ? "bg-green-500 text-white hover:bg-green-600" 
                    : "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400"
                )}
              >
                <RefreshCcw className={cn("w-4 h-4", updateStatus === 'checking' && "animate-spin")} />
                {updateStatus === 'checking'
                  ? t('checkingUpdates')
                  : updateStatus === 'found'
                  ? t('updateAvailable')
                  : updateStatus === 'none'
                  ? t('noUpdateFound')
                  : updateStatus === 'error'
                  ? t('updateError')
                  : t('checkForUpdates')}
              </button>

              <div className="w-full h-px bg-gray-100 dark:bg-white/5 my-2" />

              <div className="space-y-4">
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{t('developedWith')}</p>
                  <div className="flex items-center gap-1.5 text-red-500">
                    <Heart className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">by Batuhan Eroğlu</span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  <a
                    href="https://github.com/siadialiga"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                  >
                    <Github className="w-4 h-4" />
                    {t('github')}
                  </a>
                  <a
                    href="https://batuhan.tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                  >
                    <Globe className="w-4 h-4" />
                    {t('portfolio')}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
