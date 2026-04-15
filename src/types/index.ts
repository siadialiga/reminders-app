// ==================== CORE TYPES ====================

export type ThemeMode = 'light' | 'dark' | 'system' | 'auto';

export type TaskPriority = 'none' | 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  notes: string;
  completed: boolean;
  listId: string;
  priority: TaskPriority;
  dueDate: string | null; // ISO string
  dueTime: string | null; // "HH:mm"
  reminderEnabled: boolean;
  notified: boolean;
  createdAt: string;
  updatedAt: string;
  flagged: boolean;
}

export type ListColor =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'mint'
  | 'teal'
  | 'cyan'
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'pink'
  | 'brown'
  | 'gray';

export interface TaskList {
  id: string;
  name: string;
  color: ListColor;
  icon: string;
  createdAt: string;
  isDefault?: boolean;
}

export type SidebarView = 'today' | 'scheduled' | 'all' | 'flagged' | 'completed' | string; // string = listId

export interface AppSettings {
  userName: string;
  theme: ThemeMode;
  notificationsEnabled: boolean;
  autoThemeDayStart: number;   // hour 0-23, e.g. 7
  autoThemeNightStart: number; // hour 0-23, e.g. 19
  showCompletedTasks: boolean;
  language: string;
  autoStart: boolean;
  minimizeToTray: boolean;
}

export interface AppState {
  tasks: Task[];
  lists: TaskList[];
  settings: AppSettings;
  selectedView: SidebarView;
  onboardingDone: boolean;
}
