import React, { useState } from 'react';
import { RefreshCw, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { useTranslation } from '../../i18n';
import { ConfirmModal } from '../ui';
import type { Task, TaskList } from '../../types';
import { cn } from '../../utils';

export function TrashView() {
  const { state, restoreTask, hardDeleteTask, restoreList, hardDeleteList, emptyTrash } = useApp();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'tasks' | 'lists'>('tasks');
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [selectedListIds, setSelectedListIds] = useState<Set<string>>(new Set());
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const deletedTasks = state.tasks.filter((t) => t.isDeleted);
  const deletedLists = state.lists.filter((l) => l.isDeleted);

  const toggleTaskSelection = (id: string) => {
    const next = new Set(selectedTaskIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedTaskIds(next);
  };

  const toggleListSelection = (id: string) => {
    const next = new Set(selectedListIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedListIds(next);
  };

  const handleRestoreSelected = () => {
    if (activeTab === 'tasks') {
      selectedTaskIds.forEach(id => restoreTask(id));
      setSelectedTaskIds(new Set());
    } else {
      selectedListIds.forEach(id => restoreList(id));
      setSelectedListIds(new Set());
    }
  };

  const handleDeleteSelected = () => {
    if (activeTab === 'tasks') {
      selectedTaskIds.forEach(id => hardDeleteTask(id));
      setSelectedTaskIds(new Set());
    } else {
      selectedListIds.forEach(id => hardDeleteList(id));
      setSelectedListIds(new Set());
    }
  };

  const handleEmptyTrash = () => {
    setIsConfirmOpen(true);
  };

  const onConfirmEmptyTrash = () => {
    emptyTrash();
    setSelectedTaskIds(new Set());
    setSelectedListIds(new Set());
    setIsConfirmOpen(false);
  };

  const hasSelection = activeTab === 'tasks' ? selectedTaskIds.size > 0 : selectedListIds.size > 0;

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-[#1C1C1E] overflow-hidden">
      <div className="px-8 pt-6 pb-4 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[34px] font-bold tracking-tight leading-none mb-2 text-gray-800 dark:text-gray-100">
            {t('trash')}
          </h1>
          <p className="text-[13px] font-medium text-gray-400 dark:text-gray-500">
            {deletedTasks.length} {t('tasksInTrash')} {deletedLists.length} {t('listsInTrash')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(deletedTasks.length > 0 || deletedLists.length > 0) && (
            <button
              onClick={handleEmptyTrash}
              className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-500/10 rounded-md hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
            >
              {t('emptyTrashTitle')}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 py-3 flex gap-4 border-b border-gray-100 dark:border-white/5">
        <button
          onClick={() => setActiveTab('tasks')}
          className={cn(
            "text-sm font-semibold transition-colors pb-1 border-b-2",
            activeTab === 'tasks' ? "text-blue-500 border-blue-500" : "text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-gray-300"
          )}
        >
          {t('remindersCount')} ({deletedTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('lists')}
          className={cn(
            "text-sm font-semibold transition-colors pb-1 border-b-2",
            activeTab === 'lists' ? "text-blue-500 border-blue-500" : "text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-gray-300"
          )}
        >
          {t('listsCount')} ({deletedLists.length})
        </button>
      </div>

      {/* Actions Bar */}
      {hasSelection && (
        <div className="px-8 py-2 bg-blue-50 dark:bg-blue-500/10 flex gap-3 border-b border-gray-100 dark:border-white/5">
          <button
            onClick={handleRestoreSelected}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <RefreshCw className="w-4 h-4" /> {t('restoreSelected')}
          </button>
          <button
            onClick={handleDeleteSelected}
            className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 className="w-4 h-4" /> {t('deleteSelected')}
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {activeTab === 'tasks' && (
          <div className="space-y-1">
            {deletedTasks.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">{t('noDeletedReminders')}</div>
            ) : (
              deletedTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors",
                    selectedTaskIds.has(task.id) && "bg-blue-50 dark:bg-blue-500/10"
                  )}
                  onClick={() => toggleTaskSelection(task.id)}
                >
                  {selectedTaskIds.has(task.id) ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{task.title}</p>
                    <p className="text-xs text-gray-500">{t('deletedPrefix')} {new Date(task.deletedAt || '').toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'lists' && (
          <div className="space-y-1">
            {deletedLists.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">{t('noDeletedLists')}</div>
            ) : (
              deletedLists.map((list) => (
                <div
                  key={list.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors",
                    selectedListIds.has(list.id) && "bg-blue-50 dark:bg-blue-500/10"
                  )}
                  onClick={() => toggleListSelection(list.id)}
                >
                  {selectedListIds.has(list.id) ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{list.name}</p>
                    <p className="text-xs text-gray-500">{t('deletedPrefix')} {new Date(list.deletedAt || '').toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={onConfirmEmptyTrash}
        title={t('emptyTrashTitle') || 'Empty Trash'}
        message={t('emptyTrashConfirm') || 'Are you sure you want to empty the trash?'}
        confirmLabel={t('empty') || 'Empty'}
        cancelLabel={t('cancel')}
      />
    </div>
  );
}
