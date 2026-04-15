import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
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
  userName: '',
  theme: 'light',
  notificationsEnabled: true,
  autoThemeDayStart: 7,
  autoThemeNightStart: 19,
  showCompletedTasks: true,
  language: 'en',
  autoStart: true,
  minimizeToTray: true,
};

const INITIAL_STATE: AppState = {
  tasks: [],
  lists: DEFAULT_LISTS,
  settings: DEFAULT_SETTINGS,
  selectedView: 'today',
  onboardingDone: false,
};

const STORAGE_KEY = 'macos-reminders-data';

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'COMPLETE_ONBOARDING'; payload: { userName: string } }
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
  | { type: 'MARK_NOTIFIED'; payload: string };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  const now = new Date().toISOString();
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...INITIAL_STATE, ...action.payload };

    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        onboardingDone: true,
        settings: { ...state.settings, userName: action.payload.userName },
      };

    case 'ADD_TASK': {
      const task: Task = {
        ...action.payload,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        notified: false,
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
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) };

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
        lists: state.lists.filter((l) => l.id !== action.payload),
        tasks: state.tasks.filter((t) => t.listId !== action.payload),
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

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Convenience actions
  completeOnboarding: (userName: string) => void;
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
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppState>;
        dispatch({ type: 'LOAD_STATE', payload: parsed });
        // Sync i18n language from persisted state
        if (parsed.settings?.language) {
          initLanguage(parsed.settings.language as 'tr' | 'en');
        }
      }
    } catch {
      console.warn('Failed to load state from localStorage');
    }
  }, []);

  // Persist to localStorage on every state change
  useEffect(() => {
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

  const completeOnboarding = useCallback((userName: string) => {
    dispatch({ type: 'COMPLETE_ONBOARDING', payload: { userName } });
  }, []);

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

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  const clearAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'CLEAR_ALL_DATA' });
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        completeOnboarding,
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
