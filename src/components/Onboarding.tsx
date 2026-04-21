import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2, ArrowRight, ArrowLeft, Sparkles,
  Sun, Moon, Monitor, Bell, Rocket, Globe
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useTranslation } from '../i18n';
import { cn } from '../utils';
import { enable, disable } from '@tauri-apps/plugin-autostart';

// Apply theme class immediately without waiting for context re-render
function applyThemeNow(theme: 'light' | 'dark' | 'system') {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    // system
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}

export function Onboarding() {
  const { completeOnboarding, updateSettings, state } = useApp();
  const { t, changeLanguage, language } = useTranslation();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const FLAGS = {
    en: 'https://flagcdn.com/w80/gb.png',
    tr: 'https://flagcdn.com/w80/tr.png',
  };

  const STEPS = [
    { id: 'language' },
    { id: 'welcome' },
    { id: 'appearance' },
    { id: 'preferences' },
    { id: 'name' },
    { id: 'ready' },
  ];

  const TOTAL = STEPS.length;

  // Apply theme on mount based on current settings
  useEffect(() => {
    applyThemeNow(state.settings.theme as 'light' | 'dark' | 'system');
  }, []);

  useEffect(() => {
    if (step === 4) setTimeout(() => inputRef.current?.focus(), 300);
  }, [step]);

  const handleNext = async () => {
    if (step === 3) {
      if (state.settings.autoStart) {
        try { await enable(); } catch (e) { console.error(e); }
      } else {
        try { await disable(); } catch (e) { console.error(e); }
      }
    }
    if (step === 4) {
      if (!name.trim()) { setError(t('onboarding_nameError')); return; }
      setError('');
    }
    if (step < TOTAL - 1) {
      setStep(s => s + 1);
    } else {
      completeOnboarding(name.trim() || t('user_default'), false);
    }
  };

  const handleBack = () => { if (step > 1) setStep(s => s - 1); };
  const handleSkipTutorial = () => completeOnboarding(name.trim() || t('user_default'), true);
  const handleLangSelect = (lang: 'tr' | 'en') => {
    changeLanguage(lang);
    updateSettings({ language: lang });
    setStep(1);
  };

  const isLastStep = step === TOTAL - 1;
  const themeOptions = [
    { id: 'light', labelKey: 'theme_light' as const, icon: Sun, descKey: 'theme_clean_bright' as const },
    { id: 'dark',  labelKey: 'theme_dark'  as const, icon: Moon, descKey: 'theme_easy_eyes'   as const },
    { id: 'system',labelKey: 'theme_system' as const, icon: Monitor, descKey: 'theme_follows_system' as const },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/40 dark:from-[#1C1C1E] dark:via-[#1C1C1E] dark:to-[#2C2C2E]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-400/5 dark:bg-blue-400/[0.03] blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-violet-400/5 dark:bg-violet-400/[0.03] blur-3xl" />
      </div>

      <div
        key={step}
        className="relative z-10 w-full max-w-[420px] mx-4 animate-in fade-in slide-in-from-bottom-4 duration-400"
      >
        {/* App icon */}
        <div className="flex justify-center mb-8">
          <div className="w-[76px] h-[76px] rounded-[22px] bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
            <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={1.8} />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/80 dark:bg-[#2C2C2E]/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/8 dark:shadow-black/30 border border-white/60 dark:border-white/10 p-8">

          {/* ── STEP 0: Language ───────────────────────────────── */}
          {step === 0 && (
            <>
              <div className="text-center mb-7">
                <Globe className="w-7 h-7 text-blue-500 mx-auto mb-3" />
                <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-1">Welcome!</h1>
                <p className="text-sm text-gray-400 dark:text-gray-500">Select your language to get started.</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Başlamak için dilinizi seçin.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[{ id: 'en', label: 'English', flag: FLAGS.en }, { id: 'tr', label: 'Türkçe', flag: FLAGS.tr }].map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => handleLangSelect(lang.id as 'tr' | 'en')}
                    className={cn(
                      'flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 group',
                      language === lang.id
                        ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-500/15 shadow-sm'
                        : 'border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-white/5 hover:border-gray-200 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/10'
                    )}
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-gray-200/60 dark:ring-white/15 shadow-sm group-hover:scale-110 transition-transform">
                      <img src={lang.flag} alt={lang.label} className="w-full h-full object-cover" />
                    </div>
                    <span className={cn('text-sm font-semibold', language === lang.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300')}>
                      {lang.label}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── STEP 1: Welcome features ───────────────────────── */}
          {step === 1 && (
            <>
              <div className="text-center mb-7">
                <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-2">{t('onboarding_welcome')}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t('onboarding_welcomeDesc')}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { emoji: '📋', label: t('onboarding_feat_lists'), color: 'bg-blue-50 dark:bg-blue-500/10' },
                  { emoji: '⏰', label: t('onboarding_feat_reminders'), color: 'bg-orange-50 dark:bg-orange-500/10' },
                  { emoji: '🎯', label: t('onboarding_feat_priorities'), color: 'bg-green-50 dark:bg-green-500/10' },
                  { emoji: '🗂️', label: 'Kanban Board', color: 'bg-purple-50 dark:bg-purple-500/10' },
                  { emoji: '🏷️', label: 'Tags & Subtasks', color: 'bg-pink-50 dark:bg-pink-500/10' },
                  { emoji: '🗑️', label: 'Trash Bin', color: 'bg-red-50 dark:bg-red-500/10' },
                ].map(f => (
                  <div key={f.label} className={cn('flex flex-col items-center gap-2 p-3.5 rounded-2xl', f.color)}>
                    <span className="text-2xl">{f.emoji}</span>
                    <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 text-center leading-tight">{f.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── STEP 2: Appearance ────────────────────────────── */}
          {step === 2 && (
            <>
              <div className="text-center mb-7">
                <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-2">{t('appearance')}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('appearance_desc')}</p>
              </div>
              <div className="flex flex-col gap-3">
                {themeOptions.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = state.settings.theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        updateSettings({ theme: opt.id as any });
                        applyThemeNow(opt.id as any); // instant visual feedback
                      }}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200',
                        isSelected
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-500/10 shadow-sm'
                          : 'border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                        isSelected ? 'bg-blue-500 shadow-md shadow-blue-500/30' : 'bg-gray-100 dark:bg-white/10'
                      )}>
                        <Icon className={cn('w-5 h-5', isSelected ? 'text-white' : 'text-gray-500 dark:text-gray-300')} />
                      </div>
                      <div>
                        <p className={cn('text-sm font-semibold', isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-100')}>{t(opt.labelKey)}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{t(opt.descKey)}</p>
                      </div>
                      {isSelected && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── STEP 3: Preferences ───────────────────────────── */}
          {step === 3 && (
            <>
              <div className="text-center mb-7">
                <Bell className="w-7 h-7 text-orange-400 mx-auto mb-3" />
                <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-2">{t('settings_title')}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Set up system-level behavior.</p>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'autoStart', label: t('autoStart'), desc: t('autoStartDesc') },
                  { key: 'minimizeToTray', label: t('minimizeToTray'), desc: t('minimizeToTrayDesc') },
                ].map(item => {
                  const enabled = state.settings[item.key as keyof typeof state.settings] as boolean;
                  return (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                      <div className="flex-1 pr-4">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.label}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => updateSettings({ [item.key]: !enabled })}
                        className={cn(
                          'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
                          enabled ? 'bg-blue-500' : 'bg-gray-200 dark:bg-white/15'
                        )}
                      >
                        <span className={cn(
                          'inline-block h-4 w-4 rounded-full bg-white mt-1 shadow transition-transform duration-200',
                          enabled ? 'translate-x-6' : 'translate-x-1'
                        )} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── STEP 4: Name ──────────────────────────────────── */}
          {step === 4 && (
            <>
              <div className="text-center mb-7">
                <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-2">{t('onboarding_namePage')}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t('onboarding_namePageDesc')}</p>
              </div>
              <div>
                <input
                  ref={inputRef}
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                  placeholder={t('onboarding_nameInput')}
                  maxLength={50}
                  className={cn(
                    'w-full bg-gray-50 dark:bg-white/5 border-2 rounded-2xl px-5 py-4 text-lg text-gray-800 dark:text-gray-100 text-center font-medium outline-none transition-all placeholder-gray-300 dark:placeholder-gray-600',
                    error
                      ? 'border-red-300 dark:border-red-500/50 focus:border-red-400 dark:focus:border-red-500'
                      : 'border-gray-200 dark:border-white/10 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-400/10 dark:focus:ring-blue-500/10'
                  )}
                />
                {error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}
              </div>
            </>
          )}

          {/* ── STEP 5: Ready ─────────────────────────────────── */}
          {step === 5 && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                  <Rocket className="w-9 h-9 text-white" />
                </div>
                <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-2">{t('onboarding_ready')}</h1>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 rounded-full border border-blue-100 dark:border-blue-500/20 mt-1">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('onboarding_hello')} <span className="text-blue-600 dark:text-blue-400 font-semibold">{name || t('user_default')}</span>! 👋
                  </span>
                </div>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-3 leading-relaxed">
                  A quick interactive tutorial will show you around. You can skip it anytime.
                </p>
              </div>
            </>
          )}

          {/* ── Navigation ────────────────────────────────────── */}
          {step !== 0 && (
            <div className="mt-7 flex items-center justify-between gap-3">
              {/* Back button */}
              <button
                onClick={handleBack}
                disabled={step === 1}
                className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200',
                  step === 1
                    ? 'text-gray-200 dark:text-gray-700 bg-gray-50 dark:bg-white/5 cursor-not-allowed'
                    : 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 active:scale-95'
                )}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Step dots (centered) */}
              <div className="flex items-center gap-1.5">
                {STEPS.slice(1).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'rounded-full transition-all duration-300',
                      i === step - 1
                        ? 'w-5 h-2 bg-blue-500'
                        : i < step - 1
                        ? 'w-2 h-2 bg-blue-300 dark:bg-blue-400/60'
                        : 'w-2 h-2 bg-gray-200 dark:bg-white/15'
                    )}
                  />
                ))}
              </div>

              {/* Continue / Start button */}
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 h-12 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm shadow-md shadow-blue-500/30 active:scale-[0.97] transition-all duration-150"
              >
                {isLastStep ? t('onboarding_start') : t('onboarding_continue')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Skip tutorial link (only on final step) */}
          {isLastStep && (
            <div className="text-center mt-4">
              <button
                onClick={handleSkipTutorial}
                className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 font-medium transition-colors"
              >
                {t('skip_tutorial')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
