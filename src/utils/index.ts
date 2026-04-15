import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { ListColor } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatDueDate(dateStr: string | null, timeStr: string | null): string {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    let label = '';
    if (isToday(date)) label = 'Bugün';
    else if (isTomorrow(date)) label = 'Yarın';
    else label = format(date, 'd MMMM', { locale: tr });
    if (timeStr) label += ` ${timeStr}`;
    return label;
  } catch {
    return dateStr;
  }
}

export function isOverdue(dateStr: string | null, timeStr: string | null): boolean {
  if (!dateStr) return false;
  try {
    const date = parseISO(dateStr);
    if (timeStr) {
      const [h, m] = timeStr.split(':').map(Number);
      date.setHours(h, m, 0, 0);
    } else {
      date.setHours(23, 59, 59, 999);
    }
    return isPast(date);
  } catch {
    return false;
  }
}

export function isDueNow(dateStr: string | null, timeStr: string | null): boolean {
  if (!dateStr || !timeStr) return false;
  try {
    const date = parseISO(dateStr);
    const [h, m] = timeStr.split(':').map(Number);
    date.setHours(h, m, 0, 0);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    return diffMs >= 0 && diffMs <= 60000; // within next 60 seconds
  } catch {
    return false;
  }
}

export const LIST_COLORS: Record<ListColor, { bg: string; light: string; text: string; border: string }> = {
  red:    { bg: 'bg-red-500',    light: 'bg-red-100 dark:bg-red-900/30',    text: 'text-red-500',    border: 'border-red-300' },
  orange: { bg: 'bg-orange-500', light: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-500', border: 'border-orange-300' },
  yellow: { bg: 'bg-yellow-400', light: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-500', border: 'border-yellow-300' },
  green:  { bg: 'bg-green-500',  light: 'bg-green-100 dark:bg-green-900/30',  text: 'text-green-500',  border: 'border-green-300' },
  mint:   { bg: 'bg-emerald-400',light: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-500', border: 'border-emerald-300' },
  teal:   { bg: 'bg-teal-500',   light: 'bg-teal-100 dark:bg-teal-900/30',   text: 'text-teal-500',   border: 'border-teal-300' },
  cyan:   { bg: 'bg-cyan-500',   light: 'bg-cyan-100 dark:bg-cyan-900/30',   text: 'text-cyan-500',   border: 'border-cyan-300' },
  blue:   { bg: 'bg-blue-500',   light: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-500',   border: 'border-blue-300' },
  indigo: { bg: 'bg-indigo-500', light: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-500', border: 'border-indigo-300' },
  purple: { bg: 'bg-purple-500', light: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-500', border: 'border-purple-300' },
  pink:   { bg: 'bg-pink-500',   light: 'bg-pink-100 dark:bg-pink-900/30',   text: 'text-pink-500',   border: 'border-pink-300' },
  brown:  { bg: 'bg-amber-700',  light: 'bg-amber-100 dark:bg-amber-900/30',  text: 'text-amber-700',  border: 'border-amber-300' },
  gray:   { bg: 'bg-gray-500',   light: 'bg-gray-100 dark:bg-gray-800',       text: 'text-gray-500',   border: 'border-gray-300' },
};

export function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getAutoTheme(dayStart: number, nightStart: number): 'light' | 'dark' {
  const hour = new Date().getHours();
  if (nightStart > dayStart) {
    return (hour >= nightStart || hour < dayStart) ? 'dark' : 'light';
  }
  return (hour >= nightStart && hour < dayStart) ? 'dark' : 'light';
}
