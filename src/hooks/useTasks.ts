import { useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { isToday, isFuture, parseISO, isPast } from 'date-fns';
import type { Task } from '../types';

export function useTasks() {
  const { state } = useApp();
  const { lists, selectedView, settings } = state;

  const validTasks = useMemo(() => state.tasks.filter((t) => !t.isDeleted), [state.tasks]);

  const visibleTasks = useMemo(() => {
    let filtered: Task[];

    switch (selectedView) {
      case 'today':
        filtered = validTasks.filter(
          (t) => t.dueDate && isToday(parseISO(t.dueDate))
        );
        break;
      case 'scheduled':
        filtered = validTasks.filter(
          (t) =>
            t.dueDate &&
            (isFuture(parseISO(t.dueDate)) || isToday(parseISO(t.dueDate)))
        );
        break;
      case 'all':
        filtered = [...validTasks];
        break;
      case 'flagged':
        filtered = validTasks.filter((t) => t.flagged);
        break;
      case 'completed':
        filtered = validTasks.filter((t) => t.completed);
        break;
      default:
        // list ID
        filtered = validTasks.filter((t) => t.listId === selectedView);
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
  }, [validTasks, selectedView, settings.showCompletedTasks]);

  const overdueTasks = useMemo(
    () =>
      validTasks.filter(
        (t) =>
          !t.completed &&
          t.dueDate &&
          isPast(parseISO(t.dueDate)) &&
          !isToday(parseISO(t.dueDate))
      ),
    [validTasks]
  );

  const todayCount = useMemo(
    () => validTasks.filter((t) => !t.completed && t.dueDate && isToday(parseISO(t.dueDate))).length,
    [validTasks]
  );

  const scheduledCount = useMemo(
    () =>
      validTasks.filter(
        (t) =>
          !t.completed &&
          t.dueDate &&
          (isFuture(parseISO(t.dueDate)) || isToday(parseISO(t.dueDate)))
      ).length,
    [validTasks]
  );

  const flaggedCount = useMemo(() => validTasks.filter((t) => !t.completed && t.flagged).length, [validTasks]);
  const allCount = useMemo(() => validTasks.filter((t) => !t.completed).length, [validTasks]);
  const completedCount = useMemo(() => validTasks.filter((t) => t.completed).length, [validTasks]);

  const getListCount = (listId: string) =>
    validTasks.filter((t) => !t.completed && t.listId === listId).length;

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
