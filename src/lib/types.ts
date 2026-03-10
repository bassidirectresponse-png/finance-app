/**
 * types.ts
 * Core TypeScript interfaces and types for Track Finance
 */

// ─── Enums / Union Types ──────────────────────────────────────────────

export type RecurrenceType = 'unico' | 'fixo_mensal' | 'fixo_anual'

export type Priority = 'urgente' | 'alta' | 'media' | 'baixa'

export type TaskStatus = 'backlog' | 'a_fazer' | 'em_progresso' | 'revisao' | 'concluido'

export type TaskRecurrence = 'unica' | 'diaria' | 'semanal' | 'mensal'

export type Period =
  | 'hoje'
  | 'ontem'
  | '7dias'
  | 'mes_atual'
  | 'mes_passado'
  | 'total'
  | 'personalizado'

// ─── Company Expenses ─────────────────────────────────────────────────

export type CompanyCategory =
  | 'software_ferramentas'
  | 'apps_assinaturas'
  | 'anuncios_marketing'
  | 'impostos_taxas'
  | 'chargeback'
  | 'reembolsos'
  | 'pagamento_colaboradores'
  | 'infraestrutura'
  | 'outros'

export interface CompanyExpense {
  id: string
  title: string
  category: CompanyCategory
  value: number
  date: string           // ISO date string (YYYY-MM-DD)
  recurrence: RecurrenceType
  notes?: string
  attachment?: string    // URL or filename
  nextDueDate?: string   // ISO date string for next payment
  createdAt: string      // ISO datetime string
}

// ─── Personal Expenses ────────────────────────────────────────────────

export type PersonalCategory =
  | 'dividas_emprestimos'
  | 'gastos_mensais_fixos'
  | 'cartao_credito'
  | 'dividas_pessoais'
  | 'lazer_entretenimento'
  | 'saude'
  | 'alimentacao'
  | 'outros'

export interface PersonalExpense {
  id: string
  title: string
  category: PersonalCategory
  value: number
  date: string           // ISO date string (YYYY-MM-DD)
  recurrence: RecurrenceType
  notes?: string
  // Debt/installment tracking (optional)
  totalDebt?: number
  installmentValue?: number
  totalInstallments?: number
  paidInstallments?: number
  nextDueDate?: string   // ISO date string for next payment
  createdAt: string      // ISO datetime string
}

// ─── Tasks ────────────────────────────────────────────────────────────

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Tag {
  id: string
  label: string
  color: string          // hex or Tailwind color string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  dueDate?: string       // ISO date string
  recurrence: TaskRecurrence
  tags: Tag[]
  subtasks: Subtask[]
  createdAt: string      // ISO datetime string
  assignee?: string      // Name or user ID
}

// ─── Date Range ───────────────────────────────────────────────────────

export interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

// ─── KPI / Dashboard ─────────────────────────────────────────────────

export interface KPIData {
  label: string
  value: number
  change: number         // percentage vs last period (positive = growth)
  sparklineData: number[]
}

// ─── Chart Data ───────────────────────────────────────────────────────

export interface MonthlyData {
  month: string          // e.g. "Mar/25"
  receita: number
  gastos_empresa: number
  gastos_pessoais: number
}

export interface CategoryBreakdown {
  category: string
  label: string
  value: number
  percentage: number
  color: string
}

// ─── Filter / Sort ────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  field: string
  direction: SortDirection
}

export interface FilterConfig {
  search: string
  categories: string[]
  recurrence: RecurrenceType | 'all'
  period: Period
  dateRange: DateRange
}

// ─── UI State ─────────────────────────────────────────────────────────

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  createdAt: string
  read: boolean
}

// ─── Label Maps (convenience re-exports) ─────────────────────────────

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  unico: 'Único',
  fixo_mensal: 'Fixo Mensal',
  fixo_anual: 'Fixo Anual',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  urgente: 'Urgente',
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  a_fazer: 'A Fazer',
  em_progresso: 'Em Progresso',
  revisao: 'Revisão',
  concluido: 'Concluído',
}

export const TASK_RECURRENCE_LABELS: Record<TaskRecurrence, string> = {
  unica: 'Única',
  diaria: 'Diária',
  semanal: 'Semanal',
  mensal: 'Mensal',
}

export const PERIOD_LABELS: Record<Period, string> = {
  hoje: 'Hoje',
  ontem: 'Ontem',
  '7dias': 'Últimos 7 Dias',
  mes_atual: 'Mês Atual',
  mes_passado: 'Mês Passado',
  total: 'Total',
  personalizado: 'Personalizado',
}

// ─── Color Maps for Priorities ────────────────────────────────────────

export const PRIORITY_COLORS: Record<Priority, string> = {
  urgente: '#FF1744',
  alta: '#F59E0B',
  media: '#06B6D4',
  baixa: '#6366F1',
}

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  backlog: '#6B7280',
  a_fazer: '#6366F1',
  em_progresso: '#F59E0B',
  revisao: '#8B5CF6',
  concluido: '#00C853',
}
