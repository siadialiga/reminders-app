import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '../../utils';

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  trigger: React.ReactNode;
  className?: string;
}

// Global event to close all menus
const CLOSE_MENUS_EVENT = 'close-all-context-menus';

export function ContextMenu({ items, trigger, className }: ContextMenuProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setVisible(false), []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close other open menus first
    window.dispatchEvent(new CustomEvent(CLOSE_MENUS_EVENT));
    
    // Calculate position
    const { clientX, clientY } = e;
    
    // Simple overflow check
    let x = clientX;
    let y = clientY;
    if (x + 192 > window.innerWidth) x -= 192;
    if (y + (items.length * 32) > window.innerHeight) y -= (items.length * 32);

    setPosition({ x, y });
    setVisible(true);
  }, [items.length]);

  useEffect(() => {
    const handleGlobalClose = () => setVisible(false);
    window.addEventListener('click', handleGlobalClose);
    window.addEventListener('contextmenu', handleGlobalClose); // close when right clicking elsewhere
    window.addEventListener(CLOSE_MENUS_EVENT, handleGlobalClose);
    
    return () => {
      window.removeEventListener('click', handleGlobalClose);
      window.removeEventListener('contextmenu', handleGlobalClose);
      window.removeEventListener(CLOSE_MENUS_EVENT, handleGlobalClose);
    };
  }, []);

  return (
    <div onContextMenu={handleContextMenu} className={cn("relative", className)}>
      {trigger}
      
      {visible && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: position.y,
            left: position.x,
            zIndex: 9999,
          }}
          className="w-48 bg-white/90 dark:bg-[#000000]/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
                close();
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-[13px] font-medium transition-colors text-left",
                item.variant === 'danger'
                  ? "text-red-500 hover:bg-red-500 hover:text-white"
                  : "text-gray-700 dark:text-gray-200 hover:bg-blue-500 hover:text-white"
              )}
            >
              {item.icon && <span className="w-4 h-4 flex items-center justify-center shrink-0">{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
