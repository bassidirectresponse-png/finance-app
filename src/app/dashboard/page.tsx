"use client"

import * as React from "react"
import {
  TrendingUp,
  Building2,
  User,
  Wallet,
} from "lucide-react"
import { KPICard } from "@/components/dashboard/kpi-card"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { ExpensePie } from "@/components/dashboard/expense-pie"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { useCompanyStore } from "@/lib/store"
import { usePersonalStore } from "@/lib/store"
import {
  MONTHLY_DATA,
  COMPANY_CATEGORIES,
  COMPANY_CATEGORY_COLORS,
  getCompanyExpensesByCategory,
} from "@/lib/data"
import type { CompanyCategory } from "@/lib/types"

// ─── Derived data helpers ───────────────────────────────────────────────

const EMPTY_MONTH = { month: '', receita: 0, gastos_empresa: 0, gastos_pessoais: 0 }
const CURRENT_MONTH = MONTHLY_DATA[MONTHLY_DATA.length - 1] || EMPTY_MONTH
const PREV_MONTH = MONTHLY_DATA[MONTHLY_DATA.length - 2] || EMPTY_MONTH
const LAST_6 = MONTHLY_DATA.length > 0 ? MONTHLY_DATA.slice(-6) : [EMPTY_MONTH]

function pctChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

function buildSparkline(key: keyof typeof MONTHLY_DATA[0]): number[] {
  return LAST_6.map((d) => d[key] as number)
}

// ─── Pie data from company expenses by category ─────────────────────────

function buildPieData() {
  const byCategory = getCompanyExpensesByCategory()
  const entries = Object.entries(byCategory) as [CompanyCategory, number][]
  return entries
    .filter(([, v]) => v > 0)
    .map(([category, value]) => ({
      name: COMPANY_CATEGORIES[category],
      value,
      color: COMPANY_CATEGORY_COLORS[category],
    }))
    .sort((a, b) => b.value - a.value)
}

// ─── Dashboard Page ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const companyExpenses = useCompanyStore((s) => s.expenses)
  const personalExpenses = usePersonalStore((s) => s.expenses)

  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // KPI values from MONTHLY_DATA (last entry = Mar/26)
  const receita = CURRENT_MONTH.receita
  const gastosEmpresa = CURRENT_MONTH.gastos_empresa
  const gastosPessoais = CURRENT_MONTH.gastos_pessoais
  const saldoLiquido = receita - gastosEmpresa - gastosPessoais

  // Change % vs previous month
  const receitaChange = pctChange(receita, PREV_MONTH.receita)
  const empresaChange = pctChange(gastosEmpresa, PREV_MONTH.gastos_empresa)
  const pessoaisChange = pctChange(gastosPessoais, PREV_MONTH.gastos_pessoais)
  const saldoPrevio =
    PREV_MONTH.receita - PREV_MONTH.gastos_empresa - PREV_MONTH.gastos_pessoais
  const saldoChange = pctChange(saldoLiquido, saldoPrevio)

  // Sparklines (last 6 months)
  const receitaSparkline = buildSparkline("receita")
  const empresaSparkline = buildSparkline("gastos_empresa")
  const pessoaisSparkline = buildSparkline("gastos_pessoais")
  const saldoSparkline = LAST_6.map(
    (d) => d.receita - d.gastos_empresa - d.gastos_pessoais
  )

  // Pie data
  const pieData = buildPieData()

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* ── Row 1: KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Total Receita"
          value={receita}
          change={receitaChange}
          sparklineData={receitaSparkline}
          icon={<TrendingUp className="w-5 h-5" />}
          colorScheme="green"
          isLoading={isLoading}
          delay={0}
        />
        <KPICard
          title="Gastos Empresa"
          value={gastosEmpresa}
          change={empresaChange}
          sparklineData={empresaSparkline}
          icon={<Building2 className="w-5 h-5" />}
          colorScheme="red"
          isLoading={isLoading}
          delay={0.05}
        />
        <KPICard
          title="Gastos Pessoais"
          value={gastosPessoais}
          change={pessoaisChange}
          sparklineData={pessoaisSparkline}
          icon={<User className="w-5 h-5" />}
          colorScheme="red"
          isLoading={isLoading}
          delay={0.1}
        />
        <KPICard
          title="Saldo Líquido"
          value={saldoLiquido}
          change={saldoChange}
          sparklineData={saldoSparkline}
          icon={<Wallet className="w-5 h-5" />}
          colorScheme={saldoLiquido >= 0 ? "green" : "red"}
          isLoading={isLoading}
          delay={0.15}
        />
      </div>

      {/* ── Row 2: Overview Chart + Pie ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left 2/3 */}
        <div className="xl:col-span-2">
          <OverviewChart data={MONTHLY_DATA} isLoading={isLoading} />
        </div>

        {/* Right 1/3 */}
        <div className="xl:col-span-1">
          <ExpensePie data={pieData} isLoading={isLoading} />
        </div>
      </div>

      {/* ── Row 3: Recent Transactions ── */}
      <RecentTransactions
        companyExpenses={companyExpenses}
        personalExpenses={personalExpenses}
        isLoading={isLoading}
      />
    </div>
  )
}
