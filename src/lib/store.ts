/**
 * store.ts
 * Zustand state management for Track Finance
 * Stores: UI, CompanyExpenses, PersonalExpenses, Tasks
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type {
  CompanyExpense,
  PersonalExpense,
  Task,
  Period,
  DateRange,
} from './types'

import {
  MOCK_COMPANY_EXPENSES,
  MOCK_PERSONAL_EXPENSES,
  MOCK_TASKS,
} from './data'

// ─── ID Generator ─────────────────────────────────────────────────────

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for environments without crypto.randomUUID
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function nowISO(): string {
  return new Date().toISOString()
}

// ─── UI Store ─────────────────────────────────────────────────────────

interface UIState {
  sidebarCollapsed: boolean
  activePeriod: Period
  dateRange: DateRange
  // Actions
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setActivePeriod: (period: Period) => void
  setDateRange: (range: DateRange) => void
  resetFilters: () => void
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarCollapsed: false,
  activePeriod: 'mes_atual',
  dateRange: { from: undefined, to: undefined },

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  setActivePeriod: (period) =>
    set({
      activePeriod: period,
      dateRange: { from: undefined, to: undefined },
    }),

  setDateRange: (range) =>
    set({
      dateRange: range,
      activePeriod: 'personalizado',
    }),

  resetFilters: () =>
    set({
      activePeriod: 'mes_atual',
      dateRange: { from: undefined, to: undefined },
    }),
}))

// ─── Company Expenses Store ───────────────────────────────────────────

interface CompanyState {
  expenses: CompanyExpense[]
  // Actions
  addExpense: (expense: Omit<CompanyExpense, 'id' | 'createdAt'>) => void
  updateExpense: (id: string, data: Partial<CompanyExpense>) => void
  deleteExpense: (id: string) => void
  duplicateExpense: (id: string) => void
  resetToMockData: () => void
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      expenses: MOCK_COMPANY_EXPENSES,

      addExpense: (expenseData) => {
        const newExpense: CompanyExpense = {
          ...expenseData,
          id: generateId(),
          createdAt: nowISO(),
        }
        set((state) => ({
          expenses: [newExpense, ...state.expenses],
        }))
      },

      updateExpense: (id, data) => {
        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id ? { ...expense, ...data } : expense
          ),
        }))
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        }))
      },

      duplicateExpense: (id) => {
        const original = get().expenses.find((e) => e.id === id)
        if (!original) return
        const duplicate: CompanyExpense = {
          ...original,
          id: generateId(),
          title: `${original.title} (cópia)`,
          createdAt: nowISO(),
        }
        set((state) => ({
          expenses: [duplicate, ...state.expenses],
        }))
      },

      resetToMockData: () => set({ expenses: MOCK_COMPANY_EXPENSES }),
    }),
    {
      name: 'track-finance:company-expenses',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ─── Personal Expenses Store ──────────────────────────────────────────

interface PersonalState {
  expenses: PersonalExpense[]
  // Actions
  addExpense: (expense: Omit<PersonalExpense, 'id' | 'createdAt'>) => void
  updateExpense: (id: string, data: Partial<PersonalExpense>) => void
  deleteExpense: (id: string) => void
  duplicateExpense: (id: string) => void
  markInstallmentPaid: (id: string) => void
  resetToMockData: () => void
}

export const usePersonalStore = create<PersonalState>()(
  persist(
    (set, get) => ({
      expenses: MOCK_PERSONAL_EXPENSES,

      addExpense: (expenseData) => {
        const newExpense: PersonalExpense = {
          ...expenseData,
          id: generateId(),
          createdAt: nowISO(),
        }
        set((state) => ({
          expenses: [newExpense, ...state.expenses],
        }))
      },

      updateExpense: (id, data) => {
        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id ? { ...expense, ...data } : expense
          ),
        }))
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        }))
      },

      duplicateExpense: (id) => {
        const original = get().expenses.find((e) => e.id === id)
        if (!original) return
        const duplicate: PersonalExpense = {
          ...original,
          id: generateId(),
          title: `${original.title} (cópia)`,
          createdAt: nowISO(),
        }
        set((state) => ({
          expenses: [duplicate, ...state.expenses],
        }))
      },

      markInstallmentPaid: (id) => {
        set((state) => ({
          expenses: state.expenses.map((expense) => {
            if (expense.id !== id) return expense
            const paid = (expense.paidInstallments ?? 0) + 1
            const total = expense.totalInstallments ?? paid
            return {
              ...expense,
              paidInstallments: Math.min(paid, total),
            }
          }),
        }))
      },

      resetToMockData: () => set({ expenses: MOCK_PERSONAL_EXPENSES }),
    }),
    {
      name: 'track-finance:personal-expenses',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ─── Tasks Store ──────────────────────────────────────────────────────

interface TasksState {
  tasks: Task[]
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (id: string, data: Partial<Task>) => void
  deleteTask: (id: string) => void
  moveTask: (id: string, status: Task['status']) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  addSubtask: (taskId: string, title: string) => void
  deleteSubtask: (taskId: string, subtaskId: string) => void
  resetToMockData: () => void
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: MOCK_TASKS,

      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: generateId(),
          createdAt: nowISO(),
        }
        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }))
      },

      updateTask: (id, data) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...data } : task
          ),
        }))
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }))
      },

      moveTask: (id, status) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, status } : task
          ),
        }))
      },

      toggleSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task
            return {
              ...task,
              subtasks: task.subtasks.map((sub) =>
                sub.id === subtaskId
                  ? { ...sub, completed: !sub.completed }
                  : sub
              ),
            }
          }),
        }))
      },

      addSubtask: (taskId, title) => {
        const newSubtask = {
          id: generateId(),
          title,
          completed: false,
        }
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task
            return {
              ...task,
              subtasks: [...task.subtasks, newSubtask],
            }
          }),
        }))
      },

      deleteSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task
            return {
              ...task,
              subtasks: task.subtasks.filter((sub) => sub.id !== subtaskId),
            }
          }),
        }))
      },

      resetToMockData: () => set({ tasks: MOCK_TASKS }),
    }),
    {
      name: 'track-finance:tasks',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ─── Selector Hooks (derived data) ───────────────────────────────────

/**
 * Returns company expenses filtered by period.
 * Use within a component: const filtered = useFilteredCompanyExpenses()
 */
export function useFilteredCompanyExpenses() {
  const expenses = useCompanyStore((s) => s.expenses)
  const { activePeriod, dateRange } = useUIStore()
  return filterByPeriod(expenses, activePeriod, dateRange)
}

/**
 * Returns personal expenses filtered by period.
 */
export function useFilteredPersonalExpenses() {
  const expenses = usePersonalStore((s) => s.expenses)
  const { activePeriod, dateRange } = useUIStore()
  return filterByPeriod(expenses, activePeriod, dateRange)
}

// ─── Filter Utility ───────────────────────────────────────────────────

type WithDate = { date: string }

function filterByPeriod<T extends WithDate>(
  items: T[],
  period: Period,
  dateRange: DateRange
): T[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (period) {
    case 'hoje': {
      const todayStr = today.toISOString().slice(0, 10)
      return items.filter((item) => item.date === todayStr)
    }

    case 'ontem': {
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().slice(0, 10)
      return items.filter((item) => item.date === yesterdayStr)
    }

    case '7dias': {
      const sevenDaysAgo = new Date(today)
      sevenDaysAgo.setDate(today.getDate() - 7)
      return items.filter((item) => {
        const d = new Date(item.date)
        return d >= sevenDaysAgo && d <= today
      })
    }

    case 'mes_atual': {
      const year = now.getFullYear()
      const month = now.getMonth()
      return items.filter((item) => {
        const d = new Date(item.date)
        return d.getFullYear() === year && d.getMonth() === month
      })
    }

    case 'mes_passado': {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const year = d.getFullYear()
      const month = d.getMonth()
      return items.filter((item) => {
        const itemDate = new Date(item.date)
        return itemDate.getFullYear() === year && itemDate.getMonth() === month
      })
    }

    case 'personalizado': {
      if (!dateRange.from && !dateRange.to) return items
      return items.filter((item) => {
        const d = new Date(item.date)
        if (dateRange.from && d < dateRange.from) return false
        if (dateRange.to && d > dateRange.to) return false
        return true
      })
    }

    case 'total':
    default:
      return items
  }
}
