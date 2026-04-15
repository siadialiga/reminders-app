import { useEffect, useRef } from 'react';
import { useApp } from '../store/AppContext';
import { isDueNow } from '../utils';

// Tauri notification support (graceful fallback for browser)
async function sendNativeNotification(title: string, body: string) {
  try {
    // Tauri v2 plugin-notification
    const mod = await import('@tauri-apps/plugin-notification');
    
    let granted = await mod.isPermissionGranted();
    if (!granted) {
      const perm = await mod.requestPermission();
      granted = perm === 'granted';
    }
    if (granted) {
      mod.sendNotification({ title, body });
    }
  } catch {
    // Fallback: Web Notifications API (for dev mode in browser)
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      } else if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          new Notification(title, { body });
        }
      }
    }
  }
}

export function useNotifications() {
  const { state, dispatch } = useApp();
  const { tasks, settings } = state;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!settings.notificationsEnabled) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const check = () => {
      tasks.forEach((task) => {
        if (
          !task.completed &&
          !task.notified &&
          task.reminderEnabled &&
          isDueNow(task.dueDate, task.dueTime)
        ) {
          sendNativeNotification('Reminders', task.title);
          dispatch({ type: 'MARK_NOTIFIED', payload: task.id });
        }
      });
    };

    check(); // immediate on mount/change
    timerRef.current = setInterval(check, 30_000); // every 30s

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [tasks, settings.notificationsEnabled, dispatch]);
}
