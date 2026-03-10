/**
 * data.ts
 * Mock data and category label maps for Track Finance
 * Realistic Brazilian financial data — Oct 2025 → Mar 2026
 */

import type {
  CompanyExpense,
  CompanyCategory,
  PersonalExpense,
  PersonalCategory,
  Task,
  TaskRecurrence,
  MonthlyData,
} from './types'

// ─── Category Label Maps ─────────────────────────────────────────────

export const COMPANY_CATEGORIES: Record<CompanyCategory, string> = {
  software_ferramentas: 'Software & Ferramentas',
  apps_assinaturas: 'Aplicativos & Assinaturas',
  anuncios_marketing: 'Anúncios & Marketing',
  impostos_taxas: 'Impostos & Taxas',
  chargeback: 'Chargeback',
  reembolsos: 'Reembolsos',
  pagamento_colaboradores: 'Pagamento de Colaboradores',
  infraestrutura: 'Infraestrutura',
  outros: 'Outros',
}

export const PERSONAL_CATEGORIES: Record<PersonalCategory, string> = {
  dividas_emprestimos: 'Dívidas & Empréstimos',
  gastos_mensais_fixos: 'Gastos Mensais Fixos',
  cartao_credito: 'Cartão de Crédito',
  dividas_pessoais: 'Dívidas Pessoais',
  lazer_entretenimento: 'Lazer & Entretenimento',
  saude: 'Saúde',
  alimentacao: 'Alimentação',
  outros: 'Outros',
}

// ─── Category Colors ──────────────────────────────────────────────────

export const COMPANY_CATEGORY_COLORS: Record<CompanyCategory, string> = {
  software_ferramentas: '#6366F1',
  apps_assinaturas: '#8B5CF6',
  anuncios_marketing: '#F59E0B',
  impostos_taxas: '#F43F5E',
  chargeback: '#FF1744',
  reembolsos: '#06B6D4',
  pagamento_colaboradores: '#10B981',
  infraestrutura: '#F97316',
  outros: '#9CA3AF',
}

export const PERSONAL_CATEGORY_COLORS: Record<PersonalCategory, string> = {
  dividas_emprestimos: '#FF1744',
  gastos_mensais_fixos: '#6366F1',
  cartao_credito: '#F43F5E',
  dividas_pessoais: '#F97316',
  lazer_entretenimento: '#F59E0B',
  saude: '#10B981',
  alimentacao: '#06B6D4',
  outros: '#9CA3AF',
}

// ─── Mock Company Expenses ────────────────────────────────────────────

export const MOCK_COMPANY_EXPENSES: CompanyExpense[] = []

// ─── Mock Personal Expenses ────────────────────────────────────────────

export const MOCK_PERSONAL_EXPENSES: PersonalExpense[] = []

// ─── Mock Tasks ────────────────────────────────────────────────────────

export const MOCK_TASKS: Task[] = []


// ─── Monthly Summary Data (last 12 months) ────────────────────────────

export const MONTHLY_DATA: MonthlyData[] = []

// ─── Computed Helpers ─────────────────────────────────────────────────

/**
 * Returns total company expenses for a given month label.
 */
export function getMonthlyCompanyTotal(month: string): number {
  return MONTHLY_DATA.find(d => d.month === month)?.gastos_empresa ?? 0
}

/**
 * Returns total personal expenses for a given month label.
 */
export function getMonthlyPersonalTotal(month: string): number {
  return MONTHLY_DATA.find(d => d.month === month)?.gastos_pessoais ?? 0
}

/**
 * Returns the sum of all company expense values.
 */
export function getTotalCompanyExpenses(): number {
  return MOCK_COMPANY_EXPENSES.reduce((acc, e) => acc + e.value, 0)
}

/**
 * Returns the sum of all personal expense values.
 */
export function getTotalPersonalExpenses(): number {
  return MOCK_PERSONAL_EXPENSES.reduce((acc, e) => acc + e.value, 0)
}

/**
 * Returns company expenses grouped by category with totals.
 */
export function getCompanyExpensesByCategory(): Record<CompanyCategory, number> {
  const result = {} as Record<CompanyCategory, number>
  for (const expense of MOCK_COMPANY_EXPENSES) {
    result[expense.category] = (result[expense.category] ?? 0) + expense.value
  }
  return result
}

/**
 * Returns personal expenses grouped by category with totals.
 */
export function getPersonalExpensesByCategory(): Record<PersonalCategory, number> {
  const result = {} as Record<PersonalCategory, number>
  for (const expense of MOCK_PERSONAL_EXPENSES) {
    result[expense.category] = (result[expense.category] ?? 0) + expense.value
  }
  return result
}

/**
 * Returns task counts by status.
 */
export function getTaskCountsByStatus() {
  return MOCK_TASKS.reduce(
    (acc, task) => {
      acc[task.status] = (acc[task.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
}
