import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { useTranslation } from '../../i18n';

export function UpdateBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Check for updates on mount
  React.useEffect(() => {
    checkForUpdate();
  }, []);

  async function checkForUpdate() {
    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const update = await check();
      if (update) {
        setVisible(true);
      }
    } catch {
      // No update available or plugin not configured yet
    }
  }

  async function installUpdate() {
    try {
      const { open } = await import('@tauri-apps/plugin-opener');
      await open('https://github.com/siadialiga/reminders-app/releases');
    } catch (err) {
      console.error('Failed to open github releases:', err);
    }
  }

  if (!visible) return null;

  return (
    <div className="shrink-0 flex items-center justify-center gap-3 px-4 py-2 bg-blue-500 text-white text-sm font-medium">
      <Download className="w-4 h-4" />
      <span>{t('updateAvailable')}</span>
      <button
        onClick={installUpdate}
        className="px-3 py-0.5 rounded-md bg-white/20 hover:bg-white/30 font-semibold text-xs transition-colors"
      >
        {t('update')}
      </button>
      <button
        onClick={() => setVisible(false)}
        className="ml-auto w-5 h-5 flex items-center justify-center rounded hover:bg-white/20 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
