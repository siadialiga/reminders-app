import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { AppState, Task, TaskList, AppSettings, SidebarView } from '../types';
import { generateId } from '../utils';
import { initLanguage } from '../i18n';

// ─── Default Data ────────────────────────────────────────────────────────────

const DEFAULT_LISTS: TaskList[] = [
  { id: 'personal', name: 'Personal', color: 'blue', icon: 'User', createdAt: new Date().toISOString(), isDefault: true },
  { id: 'work', name: 'Work', color: 'orange', icon: 'Briefcase', createdAt: new Date().toISOString(), isDefault: true },
  { id: 'shopping', name: 'Shopping', color: 'green', icon: 'ShoppingCart', createdAt: new Date().toISOString(), isDefault: true },
];

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  theme: 'system',
  userName: '',
  autoStart: false,
  minimizeToTray: false,
  notificationsEnabled: true,
  autoThemeDayStart: 7,
  autoThemeNightStart: 19,
  showCompletedTasks: true,
  viewMode: 'list',
  tutorialCompleted: false,
};

const INITIAL_STATE: AppState = {
  tasks: [],
  lists: DEFAULT_LISTS,
  settings: DEFAULT_SETTINGS,
  selectedView: 'today',
  onboardingDone: false,
};

const STORAGE_KEY = 'macos-reminders-data';
const STORAGE_VERSION = '1.0.0'; // bump this whenever AppState shape changes significantly
const STORAGE_VERSION_KEY = 'macos-reminders-version';

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'COMPLETE_ONBOARDING'; payload: { userName: string; skipTutorial?: boolean } }
  | { type: 'COMPLETE_TUTORIAL' }
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'notified'> }
  | { type: 'UPDATE_TASK'; payload: { id: string; changes: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'ADD_LIST'; payload: Omit<TaskList, 'id' | 'createdAt'> }
  | { type: 'UPDATE_LIST'; payload: { id: string; changes: Partial<TaskList> } }
  | { type: 'DELETE_LIST'; payload: string }
  | { type: 'REORDER_LISTS'; payload: string[] }
  | { type: 'SET_VIEW'; payload: SidebarView }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'CLEAR_ALL_DATA' }
  | { type: 'MARK_NOTIFIED'; payload: string }
  | { type: 'RESTORE_TASK'; payload: string }
  | { type: 'HARD_DELETE_TASK'; payload: string }
  | { type: 'RESTORE_LIST'; payload: string }
  | { type: 'HARD_DELETE_LIST'; payload: string }
  | { type: 'EMPTY_TRASH' };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  const now = new Date().toISOString();
  switch (action.type) {
    case 'LOAD_STATE':
      // Deep-merge settings with defaults so that new fields added in later
      // versions always have a safe fallback value, even for old persisted data.
      return {
        ...INITIAL_STATE,
        ...action.payload,
        settings: { ...DEFAULT_SETTINGS, ...(action.payload.settings ?? {}) },
      };

    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        onboardingDone: true,
        settings: {
          ...state.settings,
          userName: action.payload.userName,
          tutorialCompleted: action.payload.skipTutorial ?? false,
        },
      };

    case 'COMPLETE_TUTORIAL':
      return {
        ...state,
        settings: { ...state.settings, tutorialCompleted: true },
      };

    case 'ADD_TASK': {
      const task: Task = {
        ...action.payload,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        notified: false,
        tags: [],
        subtasks: [],
      };
      return { ...state, tasks: [...state.tasks, task] };
    }

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload.changes, updatedAt: now } : t
        ),
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload ? { ...t, isDeleted: true, deletedAt: now, updatedAt: now } : t
        ),
      };

    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload ? { ...t, completed: !t.completed, updatedAt: now } : t
        ),
      };

    case 'ADD_LIST': {
      const list: TaskList = {
        ...action.payload,
        id: generateId(),
        createdAt: now,
      };
      return { ...state, lists: [...state.lists, list] };
    }

    case 'UPDATE_LIST':
      return {
        ...state,
        lists: state.lists.map((l) =>
          l.id === action.payload.id ? { ...l, ...action.payload.changes } : l
        ),
      };

    case 'DELETE_LIST':
      return {
        ...state,
        lists: state.lists.map((l) =>
          l.id === action.payload ? { ...l, isDeleted: true, deletedAt: now } : l
        ),
        // we also soft-delete all tasks in this list
        tasks: state.tasks.map((t) =>
          t.listId === action.payload ? { ...t, isDeleted: true, deletedAt: now, updatedAt: now } : t
        ),
        selectedView: state.selectedView === action.payload ? 'today' : state.selectedView,
      };

    case 'REORDER_LISTS': {
      const newLists = [...state.lists].sort((a, b) => {
        const indexA = action.payload.indexOf(a.id);
        const indexB = action.payload.indexOf(b.id);
        return indexA - indexB;
      });
      return { ...state, lists: newLists };
    }

    case 'SET_VIEW':
      return { ...state, selectedView: action.payload };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'CLEAR_ALL_DATA':
      return { ...INITIAL_STATE, onboardingDone: false };

    case 'MARK_NOTIFIED':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.payload ? { ...t, notified: true } : t)),
      };

    case 'RESTORE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload ? { ...t, isDeleted: false, deletedAt: undefined, updatedAt: now } : t
        ),
      };

    case 'HARD_DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) };

    case 'RESTORE_LIST':
      return {
        ...state,
        lists: state.lists.map((l) =>
          l.id === action.payload ? { ...l, isDeleted: false, deletedAt: undefined } : l
        ),
        // we could also restore tasks that belonged to this list, but let's keep it simple or explicit
      };

    case 'HARD_DELETE_LIST':
      return {
        ...state,
        lists: state.lists.filter((l) => l.id !== action.payload),
        tasks: state.tasks.filter((t) => !(t.listId === action.payload && t.isDeleted)), // forcefully remove trashed tasks of this list
      };

    case 'EMPTY_TRASH':
      return {
        ...state,
        lists: state.lists.filter((l) => !l.isDeleted),
        tasks: state.tasks.filter((t) => !t.isDeleted),
      };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Convenience actions
  completeOnboarding: (userName: string, skipTutorial?: boolean) => void;
  completeTutorial: () => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'notified'>) => void;
  updateTask: (id: string, changes: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addList: (list: Omit<TaskList, 'id' | 'createdAt'>) => void;
  updateList: (id: string, changes: Partial<TaskList>) => void;
  deleteList: (id: string) => void;
  reorderLists: (listIds: string[]) => void;
  setView: (view: SidebarView) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  clearAllData: () => void;
  restoreTask: (id: string) => void;
  hardDeleteTask: (id: string) => void;
  restoreList: (id: string) => void;
  hardDeleteList: (id: string) => void;
  emptyTrash: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const hasLoaded = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      // Version guard: if the persisted schema is from an older version, wipe it
      const savedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
      if (savedVersion !== STORAGE_VERSION) {
        console.info(`[Reminders] Storage version mismatch (${savedVersion} → ${STORAGE_VERSION}). Clearing old data.`);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION);
        hasLoaded.current = true;
        return; // start fresh with INITIAL_STATE
      }

      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppState>;
        dispatch({ type: 'LOAD_STATE', payload: parsed });
        if (parsed.settings?.language) {
          initLanguage(parsed.settings.language as 'tr' | 'en');
        }
      }
    } catch {
      console.warn('Failed to load state from localStorage');
    }
    hasLoaded.current = true;
  }, []);

  // Persist to localStorage on every state change (only after initial load)
  useEffect(() => {
    if (!hasLoaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      console.warn('Failed to save state to localStorage');
    }
  }, [state]);

  // Sync settings with Rust backend
  useEffect(() => {
    const syncSettings = async () => {
      try {
        await invoke('update_settings', { minimizeToTray: state.settings.minimizeToTray });
      } catch (err) {
        console.error('Failed to sync settings with Rust:', err);
      }
    };
    syncSettings();
  }, [state.settings.minimizeToTray]);

  const completeOnboarding = (userName: string, skipTutorial?: boolean) => {
    dispatch({ type: 'COMPLETE_ONBOARDING', payload: { userName, skipTutorial } });
  };

  const completeTutorial = () => {
    dispatch({ type: 'COMPLETE_TUTORIAL' });
  };

  const addTask = useCallback(
    (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'notified'>) => {
      dispatch({ type: 'ADD_TASK', payload: task });
    },
    []
  );

  const updateTask = useCallback((id: string, changes: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, changes } });
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  }, []);

  const toggleTask = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_TASK', payload: id });
  }, []);

  const addList = useCallback((list: Omit<TaskList, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_LIST', payload: list });
  }, []);

  const updateList = useCallback((id: string, changes: Partial<TaskList>) => {
    dispatch({ type: 'UPDATE_LIST', payload: { id, changes } });
  }, []);

  const deleteList = useCallback((id: string) => {
    dispatch({ type: 'DELETE_LIST', payload: id });
  }, []);

  const reorderLists = useCallback((listIds: string[]) => {
    dispatch({ type: 'REORDER_LISTS', payload: listIds });
  }, []);

  const setView = useCallback((view: SidebarView) => {
    dispatch({ type: 'SET_VIEW', payload: view });
  }, []);

  const updateSettings = (settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const clearAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'CLEAR_ALL_DATA' });
  }, []);

  const restoreTask = useCallback((id: string) => dispatch({ type: 'RESTORE_TASK', payload: id }), []);
  const hardDeleteTask = useCallback((id: string) => dispatch({ type: 'HARD_DELETE_TASK', payload: id }), []);
  const restoreList = useCallback((id: string) => dispatch({ type: 'RESTORE_LIST', payload: id }), []);
  const hardDeleteList = useCallback((id: string) => dispatch({ type: 'HARD_DELETE_LIST', payload: id }), []);
  const emptyTrash = useCallback(() => dispatch({ type: 'EMPTY_TRASH' }), []);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        completeOnboarding,
        completeTutorial,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        addList,
        updateList,
        deleteList,
        reorderLists,
        setView,
        updateSettings,
        clearAllData,
        restoreTask,
        hardDeleteTask,
        restoreList,
        hardDeleteList,
        emptyTrash,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
