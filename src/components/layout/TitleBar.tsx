import React from 'react';
import { Minus, Square, X, Copy } from 'lucide-react';
import { cn } from '../../utils';

// Tauri v2 window API
async function windowAction(action: 'minimize' | 'toggleMaximize' | 'close') {
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    const win = getCurrentWindow();
    
    if (action === 'minimize') {
      await win.minimize();
    } else if (action === 'toggleMaximize') {
      const isMaximized = await win.isMaximized();
      if (isMaximized) {
        await win.unmaximize();
      } else {
        await win.maximize();
      }
    } else if (action === 'close') {
      await win.close();
    }
  } catch (err) {
    console.error('Window action failed:', err);
    if (action === 'close') window.close();
  }
}

interface TitleBarProps {
  children?: React.ReactNode;
}

export function TitleBar({ children }: TitleBarProps) {
  return (
    <div className="drag-region shrink-0 h-[38px] flex items-center justify-between bg-white/80 dark:bg-[#3A3A3C]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5">
      {/* Left controls (macOS style) */}
      <div className="flex items-center gap-2 pl-4 flex-1 min-w-0">
        {children}
      </div>

      {/* Right side — window controls (Windows style) */}
      <div className="flex items-stretch h-full shrink-0">
        <button
          onClick={() => windowAction('minimize')}
          className="w-[46px] h-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-white/10 transition-colors"
          title="Minimize"
        >
          <Minus className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <button
          onClick={() => windowAction('toggleMaximize')}
          className="w-[46px] h-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-white/10 transition-colors"
          title="Maximize"
        >
          <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
        <button
          onClick={() => windowAction('close')}
          className="w-[46px] h-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-red-500 hover:text-white transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
