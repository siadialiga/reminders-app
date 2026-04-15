import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../utils';

// ─── Button ──────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
        {
          'bg-blue-500 text-white hover:bg-blue-600 active:scale-95 shadow-sm': variant === 'primary',
          'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95': variant === 'ghost',
          'bg-red-500 text-white hover:bg-red-600 active:scale-95 shadow-sm': variant === 'danger',
          'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/20 active:scale-95': variant === 'secondary',
        },
        {
          'px-2.5 py-1 text-xs': size === 'sm',
          'px-3.5 py-1.5 text-sm': size === 'md',
          'px-5 py-2.5 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</label>
      )}
      <input
        className={cn(
          'w-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all outline-none focus:border-blue-400 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

// ─── Textarea ────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</label>
      )}
      <textarea
        rows={3}
        className={cn(
          'w-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all outline-none focus:border-blue-400 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 resize-none',
          className
        )}
        {...props}
      />
    </div>
  );
}

// ─── Toggle ──────────────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer select-none py-0.5">
      {(label || description) && (
        <div>
          {label && (
            <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{label}</div>
          )}
          {description && (
            <div className="text-xs text-gray-400 dark:text-gray-500">{description}</div>
          )}
        </div>
      )}
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-[28px] w-[50px] shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
          checked ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 mt-[4px]',
            checked ? 'translate-x-[23px]' : 'translate-x-[4px]'
          )}
        />
      </button>
    </label>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
}

export function Modal({ open, onClose, title, children, width = 'max-w-md' }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (ref.current && !ref.current.contains(e.target as Node)) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150" />
      {/* Panel */}
      <div
        ref={ref}
        className={cn(
          'relative z-10 w-full rounded-2xl bg-white/90 dark:bg-[#000000]/95 backdrop-blur-xl shadow-2xl border border-gray-200/60 dark:border-white/10',
          'animate-in zoom-in-95 fade-in duration-150',
          width
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────

interface BadgeProps {
  count: number;
  color?: string;
}

export function Badge({ count, color = 'bg-gray-400 dark:bg-gray-500' }: BadgeProps) {
  if (count === 0) return null;
  return (
    <span
      className={cn(
        'ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full text-[11px] font-semibold text-white tabular-nums',
        color
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

// ─── ColorPicker ─────────────────────────────────────────────────────────────

import type { ListColor } from '../../types';
import { LIST_COLORS } from '../../utils';

const ALL_COLORS = Object.keys(LIST_COLORS) as ListColor[];

interface ColorPickerProps {
  value: ListColor;
  onChange: (c: ListColor) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {ALL_COLORS.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={cn(
            'w-7 h-7 rounded-full transition-all',
            LIST_COLORS[c].bg,
            value === c ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900 scale-110' : 'hover:scale-105'
          )}
          title={c}
        />
      ))}
    </div>
  );
}

// ─── Select ──────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</label>
      )}
      <select
        className={cn(
          'w-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-100 transition-all outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 cursor-pointer',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
// ─── Confirm Modal ──────────────────────────────────────────────────────────

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'danger'
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} width="max-w-sm">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-tight">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
          {message}
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose} className="px-5">
            {cancelLabel || 'Cancel'}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5"
          >
            {confirmLabel || 'Confirm'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
