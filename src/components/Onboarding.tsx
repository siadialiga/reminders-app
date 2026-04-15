import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useTranslation } from '../i18n';
import { cn } from '../utils';
import { enable, disable } from '@tauri-apps/plugin-autostart';

export function Onboarding() {
  const { completeOnboarding, updateSettings, state } = useApp();
  const { t, changeLanguage, language } = useTranslation();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const FLAGS = {
    en: 'https://flagcdn.com/w80/gb.png',
    tr: 'https://flagcdn.com/w80/tr.png'
  };

  const STEPS = [
    {
      id: 'language',
      title: 'Welcome!',
      subtitle: 'Please select your preferred language.',
      description: 'Lütfen tercih ettiğiniz dili seçin.',
    },
    {
      id: 'welcome',
      title: t('onboarding_welcome'),
      subtitle: t('onboarding_welcomeSub'),
      description: t('onboarding_welcomeDesc'),
    },
    {
      id: 'preferences',
      title: t('settings_title'),
      subtitle: t('general'),
      description: 'Configure how Reminders behaves on your system.',
    },
    {
      id: 'name',
      title: t('onboarding_namePage'),
      subtitle: t('onboarding_namePageSub'),
      description: t('onboarding_namePageDesc'),
    },
    {
      id: 'ready',
      title: t('onboarding_ready'),
      subtitle: t('onboarding_readySub'),
      description: '',
    },
  ];

  useEffect(() => {
    if (step === 3) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [step]);

  const handleNext = async () => {
    if (step === 2) {
      if (state.settings.autoStart) {
        try { await enable(); } catch (e) { console.error(e); }
      } else {
        try { await disable(); } catch (e) { console.error(e); }
      }
    }
    if (step === 3) {
      if (!name.trim()) {
        setError(t('onboarding_nameError'));
        return;
      }
      setError('');
    }
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      completeOnboarding(name.trim() || t('user_default'));
    }
  };

  const current = STEPS[step];

  const handleLangSelect = (lang: 'tr' | 'en') => {
    changeLanguage(lang);
    updateSettings({ language: lang });
    handleNext();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-white">
      {/* Card */}
      <div
        key={step}
        className="relative z-10 w-full max-w-md px-8 animate-in fade-in slide-in-from-bottom-4 duration-400"
      >
        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-[22px] bg-white flex items-center justify-center shadow-lg border border-gray-100">
            <CheckCircle2 className="w-11 h-11 text-blue-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Step content */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {current.title}
          </h1>
          <p className="text-base font-medium text-gray-500 mb-3">
            {current.subtitle}
          </p>
          {current.description && (
            <p className="text-sm text-gray-400 leading-relaxed">
              {current.description}
            </p>
          )}
        </div>

        {/* Step-specific content */}
        {step === 0 && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { id: 'en', label: 'English', flag: FLAGS.en },
              { id: 'tr', label: 'Türkçe', flag: FLAGS.tr },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => handleLangSelect(lang.id as 'tr' | 'en')}
                className={cn(
                  "group flex flex-col items-center gap-3 p-5 bg-gray-50 rounded-[28px] border-2 transition-all duration-200",
                  language === lang.id
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-gray-100 hover:border-gray-200"
                )}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 shadow-sm relative group-hover:scale-110 transition-transform">
                  <img src={lang.flag} alt={lang.label} className="w-full h-full object-cover" />
                </div>
                <span className={cn(
                  "text-sm font-semibold transition-colors",
                  language === lang.id ? "text-blue-600" : "text-gray-600 group-hover:text-gray-900"
                )}>
                  {lang.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { emoji: '📋', label: t('onboarding_feat_lists') },
              { emoji: '⏰', label: t('onboarding_feat_reminders') },
              { emoji: '🎯', label: t('onboarding_feat_priorities') },
            ].map((f) => (
              <div
                key={f.label}
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100"
              >
                <span className="text-2xl">{f.emoji}</span>
                <span className="text-xs font-medium text-gray-600">
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex-1 pr-4 text-left">
                <p className="text-sm font-semibold text-gray-800">{t('autoStart')}</p>
                <p className="text-[11px] text-gray-400">{t('autoStartDesc')}</p>
              </div>
              <button
                onClick={() => updateSettings({ autoStart: !state.settings.autoStart })}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
                  state.settings.autoStart ? 'bg-blue-500' : 'bg-gray-200'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 rounded-full bg-white mt-1 transition-transform duration-200',
                  state.settings.autoStart ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex-1 pr-4 text-left">
                <p className="text-sm font-semibold text-gray-800">{t('minimizeToTray')}</p>
                <p className="text-[11px] text-gray-400">{t('minimizeToTrayDesc')}</p>
              </div>
              <button
                onClick={() => updateSettings({ minimizeToTray: !state.settings.minimizeToTray })}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
                  state.settings.minimizeToTray ? 'bg-blue-500' : 'bg-gray-200'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 rounded-full bg-white mt-1 transition-transform duration-200',
                  state.settings.minimizeToTray ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mb-6">
            <div className="relative">
              <input
                ref={inputRef}
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                placeholder={t('onboarding_nameInput')}
                maxLength={50}
                className={cn(
                  'w-full bg-gray-50 border rounded-2xl px-5 py-4 text-lg text-gray-800 text-center font-medium outline-none transition-all placeholder-gray-300',
                  error
                    ? 'border-red-300 focus:border-red-400'
                    : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20'
                )}
              />
            </div>
            {error && (
              <p className="text-xs text-red-500 text-center mt-2">{error}</p>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-full border border-gray-100">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                {t('onboarding_hello')} <span className="text-blue-500 font-semibold">{name || t('user_default')}</span>! 👋
              </span>
            </div>
          </div>
        )}

        {/* CTA Button */}
        {step !== 0 && (
          <button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-base shadow-sm active:scale-[0.98] transition-all duration-150"
          >
            {step === STEPS.length - 1 ? t('onboarding_start') : t('onboarding_continue')}
            <ArrowRight className="w-5 h-5" />
          </button>
        )}

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'rounded-full transition-all duration-300',
                i === step
                  ? 'w-6 h-2 bg-blue-500'
                  : i < step
                  ? 'w-2 h-2 bg-blue-300'
                  : 'w-2 h-2 bg-gray-200'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
