import React, { useState, useRef } from 'react';
import { Plus, Search } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { useTasks } from '../../hooks/useTasks';
import { useTranslation } from '../../i18n';
import { TaskItem, TaskDetail } from '../tasks/TaskItem';
import type { Task } from '../../types';
import { cn, LIST_COLORS } from '../../utils';

export function MainArea() {
  const { state, addTask } = useApp();
  const { visibleTasks, currentList, overdueTasks } = useTasks();
  const { selectedView, lists, settings } = state;
  const { t } = useTranslation();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-close detail when task is deleted
  React.useEffect(() => {
    if (selectedTask) {
      const stillExists = state.tasks.find(t => t.id === selectedTask.id);
      if (!stillExists) {
        setSelectedTask(null);
      }
    }
  }, [state.tasks, selectedTask]);

  const getListName = (list: any) => {
    if (!list) return '';
    if (list.isDefault && (list.name === 'Personal' || list.name === 'Work' || list.name === 'Shopping')) {
      return t(list.id as any);
    }
    return list.name;
  };

  const VIEW_TITLES: Record<string, string> = {
    today: t('today'),
    scheduled: t('scheduled'),
    all: t('all'),
    flagged: t('flagged'),
    completed: t('completed'),
  };

  const title = VIEW_TITLES[selectedView] ?? getListName(currentList) ?? t('tasks');

  const VIEW_COLORS: Record<string, string> = {
    today: 'text-blue-500',
    scheduled: 'text-red-500',
    all: 'text-gray-500',
    flagged: 'text-orange-500',
    completed: 'text-[#95969a]',
  };

  const activeColorClass = currentList ? LIST_COLORS[currentList.color].text : (VIEW_COLORS[selectedView] ?? 'text-blue-500');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const listId =
      selectedView === 'today' ||
        selectedView === 'scheduled' ||
        selectedView === 'all' ||
        selectedView === 'flagged' ||
        selectedView === 'completed'
        ? lists[0]?.id ?? 'personal'
        : selectedView;

    addTask({
      title: newTitle.trim(),
      notes: '',
      completed: false,
      listId,
      priority: 'none',
      dueDate: selectedView === 'today' ? new Date().toISOString().split('T')[0] : null,
      dueTime: null,
      reminderEnabled: false,
      flagged: selectedView === 'flagged',
    });
    setNewTitle('');
    inputRef.current?.focus();
  };

  const filteredTasks = searchQuery
    ? visibleTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.notes.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : visibleTasks;

  const incompleteTasks = filteredTasks.filter((t) => !t.completed);
  const completedTasks = filteredTasks.filter((t) => t.completed);

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-[#050505]">
        {/* Header */}
        <div className="px-8 pt-6 pb-4">

          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h1
                className={cn(
                  'text-[34px] font-bold tracking-tight leading-none mb-2',
                  activeColorClass
                )}
              >
                {title}
              </h1>

              <p className="text-[13px] font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1.5 min-h-[32px]">
                {completedTasks.length} {t('completedCount')}
                {completedTasks.length > 0 && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <button
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      onClick={() => { }}
                    >
                      {t('hide')}
                    </button>
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              {incompleteTasks.length > 0 && (
                <span
                  className={cn(
                    'text-4xl font-semibold tracking-tight tabular-nums leading-none',
                    activeColorClass
                  )}
                >
                  {incompleteTasks.length}
                </span>
              )}
              
              <div className="relative w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`${t('search')}…`}
                  className="w-full bg-gray-100/50 dark:bg-white/5 border-none rounded-lg pl-9 pr-4 py-1.5 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400/20 transition-all font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-8 border-b border-gray-100 dark:border-white/5" />

        {/* Tasks */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {/* Overdue section */}
          {selectedView === 'today' && overdueTasks.length > 0 && (
            <div className="mb-4">
              <div className="px-2 mb-1.5">
                <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">
                  {t('overdue')}
                </span>
              </div>
              <div className="space-y-0.5">
                {overdueTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onSelect={setSelectedTask}
                    isSelected={selectedTask?.id === task.id}
                  />
                ))}
              </div>
              <div className="mt-3 mb-1.5 px-2">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('today')}
                </span>
              </div>
            </div>
          )}

          {/* Empty state */}
          {incompleteTasks.length === 0 && completedTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-gray-300 dark:text-gray-600">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                <Plus className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-sm">{t('noTasks')}</p>
            </div>
          )}

          {/* Incomplete tasks */}
          <div className="space-y-0.5">
            {incompleteTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onSelect={setSelectedTask}
                isSelected={selectedTask?.id === task.id}
              />
            ))}
          </div>

          {/* Completed tasks */}
          {settings.showCompletedTasks && completedTasks.length > 0 && selectedView !== 'completed' && (
            <div className="mt-4">
              <div className="px-2 mb-1.5">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t('completed')} ({completedTasks.length})
                </span>
              </div>
              <div className="space-y-0.5">
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onSelect={setSelectedTask}
                    isSelected={selectedTask?.id === task.id}
                  />
                ))}
              </div>
            </div>
          )}

          {selectedView === 'completed' && (
            <div className="space-y-0.5">
              {completedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onSelect={setSelectedTask}
                  isSelected={selectedTask?.id === task.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Add */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-white/10">
          <form onSubmit={handleAddTask} className="flex items-center gap-3">
            <button
              type="submit"
              className="w-7 h-7 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center shrink-0 transition-all active:scale-90 shadow-sm"
            >
              <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
            </button>
            <input
              ref={inputRef}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={t('newReminder')}
              className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 outline-none"
            />
          </form>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedTask && (
        <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
}
