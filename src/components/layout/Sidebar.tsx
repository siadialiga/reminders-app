import React, { useState, useEffect, useRef } from 'react';
import {
  CalendarDays, ListChecks, Flag, CheckCircle2,
  Plus, ChevronDown, Trash2, Settings, Search, Pencil
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { useTasks } from '../../hooks/useTasks';
import { useTranslation } from '../../i18n';
import { ContextMenu } from '../ui/ContextMenu';
import { LIST_COLORS, cn } from '../../utils';
import { ConfirmModal } from '../ui';
import type { ListColor, TaskList } from '../../types';

// ─── Smart View config ───────────────────────────────────────────────────────

const SMART_VIEWS = [
  {
    id: 'today',
    labelKey: 'today',
    icon: CalendarDays,
    bgColor: 'bg-blue-500',
    iconBg: 'bg-white',
    iconColor: 'text-blue-500',
  },
  {
    id: 'scheduled',
    labelKey: 'scheduled',
    icon: CalendarDays,
    bgColor: 'bg-red-500',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
  },
  {
    id: 'all',
    labelKey: 'all',
    icon: ListChecks,
    bgColor: 'bg-gray-700 dark:bg-gray-600',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
  },
  {
    id: 'flagged',
    labelKey: 'flagged',
    icon: Flag,
    bgColor: 'bg-orange-500',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
  },
  {
    id: 'completed',
    labelKey: 'completed',
    icon: CheckCircle2,
    bgColor: 'bg-[#95969a] dark:bg-gray-500',
    iconBg: 'bg-white/30',
    iconColor: 'text-white',
  },
] as const;

// ─── Color names ──────────────────────────────────────────────────────────────

const COLORS = Object.keys(LIST_COLORS) as ListColor[];

// ─── New List Modal ───────────────────────────────────────────────────────────

function NewListModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addList } = useApp();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [color, setColor] = useState<ListColor>('blue');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName('');
      setColor('blue');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addList({ name: name.trim(), color, icon: 'List' });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white dark:bg-[#000000] shadow-2xl border border-gray-200/60 dark:border-white/10 p-6 animate-in zoom-in-95 fade-in duration-150">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
          {t('newList')}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                LIST_COLORS[color].bg
              )}
            >
              <ListChecks className="w-5 h-5 text-white" />
            </div>
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('listName')}
              className="flex-1 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-gray-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
            />
          </div>

          {/* Color grid */}
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2">{t('color')}</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  title={c}
                  className={cn(
                    'w-7 h-7 rounded-full transition-all',
                    LIST_COLORS[c].bg,
                    color === c
                      ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-[#000000] scale-110'
                      : 'hover:scale-105'
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {t('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit List Modal ──────────────────────────────────────────────────────────

function EditListModal({ open, onClose, list }: { open: boolean; onClose: () => void; list: TaskList | null }) {
  const { updateList } = useApp();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [color, setColor] = useState<ListColor>('blue');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && list) {
      setName(list.name);
      setColor(list.color);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, list]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !list) return;
    updateList(list.id, { name: name.trim(), color });
    onClose();
  };

  if (!open || !list) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white dark:bg-[#000000] shadow-2xl border border-gray-200/60 dark:border-white/10 p-6">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">{t('rename')}</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', LIST_COLORS[color].bg)}>
              <ListChecks className="w-5 h-5 text-white" />
            </div>
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('listName')}
              className="flex-1 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-gray-100 outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2">{t('color')}</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn('w-7 h-7 rounded-full transition-all', LIST_COLORS[c].bg, color === c && 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-[#000000] scale-110')}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={onClose} className="px-3.5 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10">{t('cancel')}</button>
            <button type="submit" disabled={!name.trim()} className="px-3.5 py-1.5 rounded-lg text-sm bg-blue-500 text-white font-medium hover:bg-blue-600 shadow-lg shadow-blue-500/20">{t('done')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

interface SidebarProps {
  onSettingsOpen: () => void;
}

export function Sidebar({ onSettingsOpen }: SidebarProps) {
  const { state, setView, deleteList, reorderLists } = useApp();
  const { selectedView, lists } = state;
  const { t } = useTranslation();
  const { todayCount, scheduledCount, flaggedCount, allCount, completedCount, getListCount } = useTasks();

  const [showNewList, setShowNewList] = useState(false);
  const [editingList, setEditingList] = useState<TaskList | null>(null);
  const [listToDelete, setListToDelete] = useState<TaskList | null>(null);
  const [listsExpanded, setListsExpanded] = useState(true);
  const [draggedListId, setDraggedListId] = useState<string | null>(null);
  const [dragOverListId, setDragOverListId] = useState<string | null>(null);

  const getListName = (list: TaskList) => {
    if (list.isDefault && (list.name === 'Personal' || list.name === 'Work' || list.name === 'Shopping')) {
      return t(list.id as any);
    }
    return list.name;
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedListId(id);
    // Add custom drag format to ensure compatibility
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/reminders-list-id', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // continuously ensure the current target is highlighted properly
    if (dragOverListId !== id) {
      setDragOverListId(id);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Intentionally left blank. Checking closest element is tricky.
    // We clear dragOverListId fully on Drop or End. 
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation(); // prevent other things from catching it
    
    setDragOverListId(null);
    const draggedId = draggedListId;
    setDraggedListId(null);

    if (!draggedId || draggedId === targetId) return;

    const newListIds = lists.map(l => l.id);
    const draggedIndex = newListIds.indexOf(draggedId);
    const targetIndex = newListIds.indexOf(targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const movedListIds = [...newListIds];
      movedListIds.splice(draggedIndex, 1);
      movedListIds.splice(targetIndex, 0, draggedId);
      reorderLists(movedListIds);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedListId(null);
    setDragOverListId(null);
  };

  const badgeCounts: Record<string, number> = {
    today: todayCount,
    scheduled: scheduledCount,
    all: allCount,
    flagged: flaggedCount,
    completed: completedCount,
  };

  return (
    <>
      <aside className="w-[280px] shrink-0 h-full flex flex-col bg-[#f2f2f7] dark:bg-[#000000] border-r border-gray-200/60 dark:border-white/10 select-none">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <button
            onClick={onSettingsOpen}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-white/10 transition-all font-medium"
            title={t('settings')}
          >
            <Settings className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={() => setShowNewList(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-white/10 transition-all font-medium"
            title={t('newList')}
          >
            <Plus className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* Smart Views (Widgets) */}
        <div className="grid grid-cols-2 gap-2.5 px-3 mb-3">
          {SMART_VIEWS.map((view) => {
            const Icon = view.icon;
            const count = badgeCounts[view.id] ?? 0;
            const isActive = selectedView === view.id;
            const colSpan = view.id === 'completed' ? 'col-span-2' : 'col-span-1';

            return (
              <button
                key={view.id}
                onClick={() => setView(view.id)}
                className={cn(
                  'relative flex flex-col p-3 rounded-[14px] transition-all duration-200 text-left overflow-hidden shadow-sm h-[78px]',
                  isActive
                    ? 'ring-[3px] ring-blue-500/40 scale-[0.97]'
                    : 'hover:scale-[0.98] hover:shadow-md',
                  view.bgColor,
                  colSpan
                )}
              >
                <div className="flex items-start justify-between">
                  <div className={cn(
                    'w-[28px] h-[28px] rounded-full flex items-center justify-center shrink-0',
                    view.iconBg
                  )}>
                    <Icon className={cn("w-[14px] h-[14px]", view.iconColor)} strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-[20px] leading-tight tabular-nums tracking-tight text-white opacity-90">
                    {count}
                  </span>
                </div>
                <span className="mt-auto text-[13px] font-semibold tracking-tight text-white">
                  {t(view.labelKey as any)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mx-3 border-t border-gray-300/50 dark:border-white/10" />

        {/* Lists Section */}
        <div className="flex-1 overflow-y-auto px-3 pt-2">
          <button
            onClick={() => setListsExpanded((v) => !v)}
            className="w-full flex items-center gap-1.5 px-2 py-1 mb-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ChevronDown
              className={cn(
                'w-3 h-3 transition-transform duration-200',
                !listsExpanded && '-rotate-90'
              )}
            />
            {t('myLists')}
          </button>

          {listsExpanded && (
            <div className="space-y-0.5">
              {lists.map((list) => {
                const isActive = selectedView === list.id;
                const count = getListCount(list.id);
                const listName = getListName(list);
                const isDragOver = dragOverListId === list.id;
                
                return (
                  <div key={list.id}>
                    <ContextMenu
                      items={[
                        { label: t('show'), onClick: () => setView(list.id) },
                        { label: t('rename'), onClick: () => setEditingList(list), icon: <Pencil className="w-3.5 h-3.5" /> },
                        {
                          label: t('delete'),
                          onClick: () => setListToDelete(list),
                          variant: 'danger',
                          icon: <Trash2 className="w-3.5 h-3.5" />
                        },
                      ]}
                      trigger={
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, list.id)}
                          onDragOver={(e) => handleDragOver(e, list.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, list.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setView(list.id)}
                          className={cn(
                            'w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-sm font-medium transition-all duration-100 group cursor-default',
                            isActive
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/10',
                            isDragOver && 'ring-2 ring-blue-500 ring-offset-1 ring-offset-[#f2f2f7] dark:ring-offset-[#000000] bg-blue-50/50 dark:bg-blue-500/20',
                            draggedListId === list.id && 'opacity-30'
                          )}
                        >
                          <span
                            className={cn(
                              'w-7 h-7 rounded-full shrink-0 flex items-center justify-center',
                              LIST_COLORS[list.color].bg
                            )}
                          >
                            <ListChecks className="w-3.5 h-3.5 text-white" />
                          </span>
                          <span className="flex-1 text-left truncate">{listName}</span>
                          {count > 0 && (
                            <span className={cn(
                              "text-xs font-semibold tabular-nums",
                              isActive ? "text-blue-100" : "text-gray-400 dark:text-gray-500"
                            )}>
                              {count}
                            </span>
                          )}
                        </div>
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom New List */}
        <div className="px-3 pb-4 pt-2">
          <button
            onClick={() => setShowNewList(true)}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/5 transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('addList')}
          </button>
        </div>
      </aside>

      <NewListModal open={showNewList} onClose={() => setShowNewList(false)} />
      <EditListModal open={!!editingList} onClose={() => setEditingList(null)} list={editingList} />
      <ConfirmModal
        open={!!listToDelete}
        onClose={() => setListToDelete(null)}
        onConfirm={() => {
          if (listToDelete) deleteList(listToDelete.id);
        }}
        title={t('deleteListTitle')}
        message={t('deleteListConfirm')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
      />
    </>
  );
}
