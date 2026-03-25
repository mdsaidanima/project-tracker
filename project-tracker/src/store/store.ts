import { create } from 'zustand';
import { Task, FilterState, Status, Priority, ActiveUser } from '../types';
import { initialTasks } from '../utils/data-generator';

interface AppState {
  tasks: Task[];
  filters: FilterState;
  view: 'kanban' | 'list' | 'timeline';
  activeUsers: ActiveUser[];
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  updateTaskStatus: (taskId: string, newStatus: Status) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setView: (view: 'kanban' | 'list' | 'timeline') => void;
  updateActiveUsers: (activeUsers: ActiveUser[]) => void;
}

export const useStore = create<AppState>((set) => ({
  tasks: initialTasks,
  filters: {
    searchStr: '',
    status: [],
    priority: [],
    assignees: [],
    dateRange: { from: null, to: null }
  },
  view: 'kanban',
  activeUsers: [],

  setTasks: (tasks) => set({ tasks }),
  
  updateTaskStatus: (taskId, status) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === taskId ? { ...t, status } : t)
  })),

  updateTask: (taskId, updates) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === taskId ? { ...t, ...updates } : t)
  })),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  
  setView: (view) => set({ view }),
  
  updateActiveUsers: (activeUsers) => set({ activeUsers }),
}));
