import { useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { isToday, isFuture, parseISO, isPast } from 'date-fns';
import type { Task } from '../types';

export function useTasks() {
  const { state } = useApp();
  const { tasks, lists, selectedView, settings } = state;

  const visibleTasks = useMemo(() => {
    let filtered: Task[];

    switch (selectedView) {
      case 'today':
        filtered = tasks.filter(
          (t) => t.dueDate && isToday(parseISO(t.dueDate))
        );
        break;
      case 'scheduled':
        filtered = tasks.filter(
          (t) =>
            t.dueDate &&
            (isFuture(parseISO(t.dueDate)) || isToday(parseISO(t.dueDate)))
        );
        break;
      case 'all':
        filtered = [...tasks];
        break;
      case 'flagged':
        filtered = tasks.filter((t) => t.flagged);
        break;
      case 'completed':
        filtered = tasks.filter((t) => t.completed);
        break;
      default:
        // list ID
        filtered = tasks.filter((t) => t.listId === selectedView);
        break;
    }

    if (!settings.showCompletedTasks && selectedView !== 'completed') {
      filtered = filtered.filter((t) => !t.completed);
    }

    // Sort: incomplete first, then by due date, then createdAt
    return filtered.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return a.createdAt.localeCompare(b.createdAt);
    });
  }, [tasks, selectedView, settings.showCompletedTasks]);

  const overdueTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          !t.completed &&
          t.dueDate &&
          isPast(parseISO(t.dueDate)) &&
          !isToday(parseISO(t.dueDate))
      ),
    [tasks]
  );

  const todayCount = useMemo(
    () => tasks.filter((t) => !t.completed && t.dueDate && isToday(parseISO(t.dueDate))).length,
    [tasks]
  );

  const scheduledCount = useMemo(
    () =>
      tasks.filter(
        (t) =>
          !t.completed &&
          t.dueDate &&
          (isFuture(parseISO(t.dueDate)) || isToday(parseISO(t.dueDate)))
      ).length,
    [tasks]
  );

  const flaggedCount = useMemo(() => tasks.filter((t) => !t.completed && t.flagged).length, [tasks]);
  const allCount = useMemo(() => tasks.filter((t) => !t.completed).length, [tasks]);
  const completedCount = useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);

  const getListCount = (listId: string) =>
    tasks.filter((t) => !t.completed && t.listId === listId).length;

  const currentList = lists.find((l) => l.id === selectedView);

  return {
    visibleTasks,
    overdueTasks,
    todayCount,
    scheduledCount,
    flaggedCount,
    allCount,
    completedCount,
    getListCount,
    currentList,
  };
}
