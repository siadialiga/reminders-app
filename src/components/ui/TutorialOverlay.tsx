import React, { useEffect, useState } from 'react';
import { useApp } from '../../store/AppContext';
import { useTranslation } from '../../i18n';
import { Settings, Sparkles, Plus, Trash2, Search, ListTodo } from 'lucide-react';
import { cn } from '../../utils';

const STEPS = [
  {
    id: 'tutorial-smart-views',
    titleKey: 'tut_smart_title',
    descKey: 'tut_smart_desc',
    icon: Sparkles
  },
  {
    id: 'tutorial-search',
    titleKey: 'tut_search_title',
    descKey: 'tut_search_desc',
    icon: Search
  },
  {
    id: 'tutorial-add-task',
    titleKey: 'tut_add_task_title',
    descKey: 'tut_add_task_desc',
    icon: Plus
  },
  {
    id: 'tutorial-view-toggle',
    titleKey: 'tut_view_toggle_title',
    descKey: 'tut_view_toggle_desc',
    icon: ListTodo
  },
  {
    id: 'tutorial-add-list',
    titleKey: 'tut_add_list_title',
    descKey: 'tut_add_list_desc',
    icon: Plus
  },
  {
    id: 'tutorial-trash',
    titleKey: 'tut_trash_title',
    descKey: 'tut_trash_desc',
    icon: Trash2
  }
];

export function TutorialOverlay() {
  const { state, completeTutorial } = useApp();
  const { t } = useTranslation();
  const { settings, onboardingDone } = state;
  const [currentStep, setCurrentStep] = useState(0);
  const [bounds, setBounds] = useState<DOMRect | null>(null);

  // Measure the target bounds
  useEffect(() => {
    if (!onboardingDone || settings.tutorialCompleted) return;

    const measure = () => {
      const targetId = STEPS[currentStep]?.id;
      if (!targetId) return;

      const el = document.getElementById(targetId);
      if (el) {
        setBounds(el.getBoundingClientRect());
      } else {
        // Fallback bounds if element not found
        setBounds(null);
      }
    };

    // Minor delay to let dom mount
    const timeout = setTimeout(measure, 100);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', measure);
    };
  }, [currentStep, onboardingDone, settings.tutorialCompleted]);

  if (!onboardingDone || settings.tutorialCompleted) return null;

  const PADDING = 6;
  const stepData = STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      completeTutorial();
    }
  };

  const handleSkip = () => {
    completeTutorial();
  };

  const isLast = currentStep === STEPS.length - 1;
  const Icon = stepData.icon;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto">
      {/* Dynamic SVG Mask */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="tutorial-mask">
            {/* White covers the entire screen (visible background) */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black cuts out the hole */}
            {bounds && (
              <rect
                x={bounds.x - PADDING}
                y={bounds.y - PADDING}
                width={bounds.width + PADDING * 2}
                height={bounds.height + PADDING * 2}
                rx={12} // soft rounded edges
                fill="black"
                className="transition-all duration-500 ease-out"
              />
            )}
          </mask>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.6)"
          mask="url(#tutorial-mask)"
        />
      </svg>

      {/* Popover Card */}
      <div
        className="absolute max-w-[300px] w-full bg-white dark:bg-[#2C2C2E] shadow-2xl rounded-2xl p-5 border border-gray-100 dark:border-white/10 transition-all duration-500 ease-out z-10"
        style={bounds ? {
          top:
            bounds.y + bounds.height + PADDING * 2 + 200 > window.innerHeight
              ? bounds.y - PADDING - 10 // Show above if too low
              : bounds.y + bounds.height + PADDING + 10,
          left:
            bounds.x + 300 > window.innerWidth
              ? window.innerWidth - 320 // Prevent going off right screen
              : Math.max(bounds.x, 20),
          transform:
            bounds.y + bounds.height + PADDING * 2 + 200 > window.innerHeight
              ? 'translateY(-100%)'
              : 'translateY(0)',
        } : {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="flex gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-blue-500" strokeWidth={2} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-0.5">{t(stepData.titleKey as any)}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">{t(stepData.descKey as any)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            {t('skip_tutorial')}
          </button>
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(s => s - 1)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                {t('back')}
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              {isLast ? t('finish') : t('next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
