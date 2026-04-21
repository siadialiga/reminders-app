import React, { useState, useEffect, useRef } from 'react';
import {
  Check, Flag, Clock, Trash2,
  AlarmClock, Hash, ListTodo, Plus
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { useTranslation } from '../../i18n';
import { ContextMenu } from '../ui/ContextMenu';
import { ConfirmModal } from '../ui';
import type { Task, TaskPriority, Subtask } from '../../types';
import { formatDueDate, isOverdue, cn, LIST_COLORS, generateId } from '../../utils';

// ─── TaskItem ─────────────────────────────────────────────────────────────────

interface TaskItemProps {
  task: Task;
  onSelect: (task: Task) => void;
  isSelected: boolean;
}

export function TaskItem({ task, onSelect, isSelected }: TaskItemProps) {
  const { toggleTask, deleteTask, updateTask } = useApp();
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const overdue = isOverdue(task.dueDate, task.dueTime);

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTask(task.id);
  };

  const handleFlag = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    updateTask(task.id, { flagged: !task.flagged });
  };

  const handleDelete = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowDeleteConfirm(true);
  };

  return (
    <>
      <ContextMenu
        items={[
          { label: task.completed ? t('markIncomplete') : t('markComplete'), onClick: () => toggleTask(task.id) },
          { label: t('flag'), onClick: () => handleFlag(), icon: <Flag className="w-3.5 h-3.5" /> },
          { label: t('details'), onClick: () => onSelect(task), icon: <Clock className="w-3.5 h-3.5" /> },
          { label: t('delete'), onClick: () => handleDelete(), variant: 'danger', icon: <Trash2 className="w-3.5 h-3.5" /> },
        ]}
        trigger={
          <div
            className={cn(
              'group flex items-start gap-3 px-4 py-3 rounded-xl cursor-default transition-all duration-100',
              isSelected
                ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30'
                : 'hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'
            )}
            onClick={() => onSelect(task)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {/* Checkbox */}
            <button
              onClick={handleCheck}
              className={cn(
                'shrink-0 mt-0.5 w-[22px] h-[22px] rounded-full flex items-center justify-center transition-all duration-150',
                task.completed
                  ? 'bg-blue-500'
                  : 'border-[1.5px] border-gray-300 dark:border-gray-500 hover:border-gray-400'
              )}
              aria-label={task.completed ? t('markIncomplete') : t('markComplete')}
            >
              {task.completed && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'text-sm font-medium leading-snug transition-colors',
                  task.completed
                    ? 'line-through text-gray-400 dark:text-gray-500'
                    : 'text-gray-800 dark:text-gray-100'
                )}
              >
                {task.title}
              </p>
              {task.notes && (
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                  {task.notes}
                </p>
              )}
              {task.dueDate && (
                <div
                  className={cn(
                    'flex items-center gap-1 mt-1 text-xs',
                    overdue && !task.completed
                      ? 'text-red-500'
                      : 'text-gray-400 dark:text-gray-500'
                  )}
                >
                  <Clock className="w-3 h-3" />
                  <span>{formatDueDate(task.dueDate, task.dueTime)}</span>
                </div>
              )}
              {((task.tags && task.tags.length > 0) || (task.subtasks && task.subtasks.length > 0)) && (
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {task.tags?.map((t) => (
                    <span key={t} className="text-[10px] font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                      <Hash className="w-2.5 h-2.5" />
                      {t}
                    </span>
                  ))}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="text-[10px] font-medium bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                      <ListTodo className="w-2.5 h-2.5" />
                      {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions (visible on hover) */}
            <div className="flex items-center gap-1 shrink-0">
              {hovered && (
                <button
                  onClick={handleDelete}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                  title={t('delete')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              {(hovered || task.flagged) && (
                <button
                  onClick={handleFlag}
                  className={cn(
                    'w-6 h-6 flex items-center justify-center rounded-lg transition-all',
                    task.flagged
                      ? 'text-orange-400'
                      : 'text-gray-200 dark:text-gray-600 hover:text-orange-400'
                  )}
                >
                  <Flag className="w-3.5 h-3.5" fill={task.flagged ? 'currentColor' : 'none'} />
                </button>
              )}
            </div>
          </div>
        }
      />

      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteTask(task.id)}
        title={t('deleteTaskTitle')}
        message={t('deleteTaskConfirm')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
      />
    </>
  );
}

// ─── Task Detail Panel ────────────────────────────────────────────────────────

interface TaskDetailProps {
  task: Task | null;
  onClose: () => void;
}

export function TaskDetail({ task, onClose }: TaskDetailProps) {
  const { updateTask, state } = useApp();
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [listId, setListId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('none');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [subtasks, setSubtasks] = useState<Task['subtasks']>([]);

  const PRIORITIES: { value: TaskPriority; label: string }[] = [
    { value: 'none', label: t('priority_none') },
    { value: 'low', label: t('priority_low') },
    { value: 'medium', label: t('priority_medium') },
    { value: 'high', label: t('priority_high') },
  ];

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNotes(task.notes);
      setDueDate(task.dueDate ?? '');
      setDueTime(task.dueTime ?? '');
      setListId(task.listId);
      setPriority(task.priority);
      setReminderEnabled(task.reminderEnabled);
      setFlagged(task.flagged);
      setTagsInput(task.tags?.join(', ') || '');
      setSubtasks(task.subtasks || []);
    }
  }, [task]);

  const save = () => {
    if (!task) return;
    updateTask(task.id, {
      title: title.trim() || task.title,
      notes,
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      listId,
      priority,
      reminderEnabled,
      flagged,
      tags: tagsInput.split(',').map(s => s.trim()).filter(Boolean),
      subtasks,
    });
  };

  const handleAddSubtask = () => {
    setSubtasks([...(subtasks || []), { id: generateId(), title: '', completed: false }]);
  };

  const updateSubtask = (id: string, updates: Partial<Subtask>) => {
    setSubtasks(subtasks?.map(st => st.id === id ? { ...st, ...updates } : st));
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks?.filter(st => st.id !== id));
  };

  if (!task) return null;

  return (
    <div className="w-80 shrink-0 h-full flex flex-col bg-white dark:bg-[#2C2C2E] border-l border-gray-200/60 dark:border-white/10 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('details')}</h3>
        <button
          onClick={() => { save(); onClose(); }}
          className="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors"
        >
          {t('done')}
        </button>
      </div>

      <div className="flex flex-col gap-4 p-5">
        {/* Title */}
        <div>
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            {t('title')}
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={save}
            className="mt-1 w-full text-sm font-medium text-gray-800 dark:text-gray-100 bg-transparent border-b border-gray-200 dark:border-white/10 pb-1.5 outline-none focus:border-blue-400 transition-colors"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            {t('notes')}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={save}
            rows={3}
            placeholder={t('addNote')}
            className="mt-1 w-full text-sm text-gray-700 dark:text-gray-300 bg-transparent border border-gray-200 dark:border-white/10 rounded-lg p-2.5 outline-none focus:border-blue-400 transition-colors resize-none placeholder-gray-300 dark:placeholder-gray-600"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            <Hash className="w-3.5 h-3.5" />
            {t('tagsComma')}
          </label>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            onBlur={save}
            placeholder="work, urgent"
            className="w-full text-sm font-medium text-blue-500 dark:text-blue-400 bg-blue-50/50 dark:bg-white/5 border border-blue-100 dark:border-white/10 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-400 transition-colors"
          />
        </div>

        {/* Subtasks */}
        <div>
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <ListTodo className="w-3.5 h-3.5" />
            {t('subtasks')}
          </label>
          <div className="space-y-1.5">
            {subtasks?.map(st => (
              <div key={st.id} className="flex items-center gap-2 group bg-gray-50 dark:bg-white/5 rounded pl-1.5 pr-1 py-1">
                <button
                  onClick={() => { updateSubtask(st.id, { completed: !st.completed }); setTimeout(save, 0); }}
                  className={cn(
                    "w-[18px] h-[18px] rounded-full flex items-center justify-center border shrink-0",
                    st.completed ? "bg-blue-500 border-blue-500" : "border-gray-300 dark:border-gray-500"
                  )}
                >
                  {st.completed && <Check className="w-2.5 h-2.5 text-white" />}
                </button>
                <input
                  value={st.title}
                  onChange={e => updateSubtask(st.id, { title: e.target.value })}
                  onBlur={save}
                  placeholder={t('taskName')}
                  className={cn(
                    "flex-1 bg-transparent text-sm outline-none transition-colors min-w-0",
                    st.completed ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-700 dark:text-gray-200"
                  )}
                />
                <button
                  onClick={() => { removeSubtask(st.id); setTimeout(save, 0); }}
                  className="w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleAddSubtask}
            className="mt-2 flex items-center gap-1 text-[12px] font-semibold text-blue-500 hover:text-blue-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('addSubtask')}
          </button>
        </div>

        {/* Due Date */}
        <div>
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            {t('dateTime')}
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => { setDueDate(e.target.value); }}
              onBlur={save}
              className="flex-1 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-400 transition-colors"
            />
            <input
              type="time"
              value={dueTime}
              onChange={(e) => { setDueTime(e.target.value); }}
              onBlur={save}
              disabled={!dueDate}
              className="w-24 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-400 transition-colors disabled:opacity-40"
            />
          </div>
        </div>

        {/* Reminder */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <AlarmClock className="w-4 h-4 text-gray-400" />
            {t('reminder')}
          </div>
          <button
            onClick={() => { setReminderEnabled((v) => !v); setTimeout(save, 0); }}
            className={cn(
              'relative inline-flex h-[26px] w-[46px] shrink-0 rounded-full transition-colors duration-200',
              reminderEnabled ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-[18px] w-[18px] rounded-full bg-white shadow mt-[4px] transition-transform duration-200',
                reminderEnabled ? 'translate-x-[23px]' : 'translate-x-[4px]'
              )}
            />
          </button>
        </div>

        {/* Priority */}
        <div>
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
            {t('priority')}
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                onClick={() => { setPriority(p.value); setTimeout(save, 0); }}
                className={cn(
                  'py-1.5 rounded-lg text-xs font-medium transition-all border',
                  priority === p.value
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div>
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            {t('list')}
          </label>
          <select
            value={listId}
            onChange={(e) => { setListId(e.target.value); setTimeout(save, 0); }}
            className="mt-1 w-full text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-400 transition-colors"
          >
            {state.lists.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        {/* Flagged */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Flag className="w-4 h-4 text-gray-400" />
            {t('flag')}
          </div>
          <button
            onClick={() => { setFlagged((v) => !v); setTimeout(save, 0); }}
            className={cn(
              'relative inline-flex h-[26px] w-[46px] shrink-0 rounded-full transition-colors duration-200',
              flagged ? 'bg-orange-400' : 'bg-gray-200 dark:bg-gray-600'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-[18px] w-[18px] rounded-full bg-white shadow mt-[4px] transition-transform duration-200',
                flagged ? 'translate-x-[23px]' : 'translate-x-[4px]'
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
