"use client"

import * as React from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts"
import { Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { motion } from "framer-motion"

import { useCompanyStore, useUIStore } from "@/lib/store"
import {
  COMPANY_CATEGORIES,
  COMPANY_CATEGORY_COLORS,
  MONTHLY_DATA,
} from "@/lib/data"
import { formatCurrency } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { CompanyCategory, Period } from "@/lib/types"

// ─── Period Pill config ───────────────────────────────────────────────

const PERIOD_PILLS: { value: Period; label: string }[] = [
  { value: "hoje", label: "Hoje" },
  { value: "7dias", label: "7 dias" },
  { value: "mes_atual", label: "Este mês" },
  { value: "mes_passado", label: "Mês passado" },
  { value: "total", label: "Todo período" },
]

// ─── Helpers ──────────────────────────────────────────────────────────

function filterExpensesByPeriod(
  expenses: { value: number; date: string; recurrence: string }[],
  period: Period
) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (period) {
    case "hoje": {
      const todayStr = today.toISOString().slice(0, 10)
      return expenses.filter((e) => e.date === todayStr)
    }
    case "ontem": {
      const y = new Date(today)
      y.setDate(today.getDate() - 1)
      return expenses.filter((e) => e.date === y.toISOString().slice(0, 10))
    }
    case "7dias": {
      const ago = new Date(today)
      ago.setDate(today.getDate() - 7)
      return expenses.filter((e) => {
        const d = new Date(e.date)
        return d >= ago && d <= today
      })
    }
    case "mes_atual": {
      const yr = now.getFullYear()
      const mo = now.getMonth()
      return expenses.filter((e) => {
        const d = new Date(e.date)
        return d.getFullYear() === yr && d.getMonth() === mo
      })
    }
    case "mes_passado": {
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const yr = prev.getFullYear()
      const mo = prev.getMonth()
      return expenses.filter((e) => {
        const d = new Date(e.date)
        return d.getFullYear() === yr && d.getMonth() === mo
      })
    }
    case "total":
    default:
      return expenses
  }
}

// ─── Custom Tooltip ───────────────────────────────────────────────────

function CustomDonutTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold text-foreground">{payload[0].name}</p>
      <p className="text-primary">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

function CustomBarTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; fill: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-sm shadow-lg min-w-[200px]">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: p.fill }} />
          <span className="text-muted-foreground text-xs flex-1">{p.name}</span>
          <span className="text-foreground font-medium text-xs">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────

export default function AnaliseGeralPage() {
  const expenses = useCompanyStore((s) => s.expenses)
  const { activePeriod, setActivePeriod } = useUIStore()

  // Current period expenses
  const filtered = React.useMemo(
    () => filterExpensesByPeriod(expenses, activePeriod),
    [expenses, activePeriod]
  )

  // Previous period expenses (for trend comparison)
  const prevPeriod = React.useMemo<Period>(() => {
    if (activePeriod === "mes_atual") return "mes_passado"
    return "total"
  }, [activePeriod])
  const prevFiltered = React.useMemo(
    () => filterExpensesByPeriod(expenses, prevPeriod),
    [expenses, prevPeriod]
  )

  // ─── KPI Calculations ──────────────────────────────────────────────

  const totalGastos = React.useMemo(
    () => filtered.reduce((acc, e) => acc + e.value, 0),
    [filtered]
  )
  const prevTotal = React.useMemo(
    () => prevFiltered.reduce((acc, e) => acc + e.value, 0),
    [prevFiltered]
  )
  const variacao = prevTotal > 0 ? ((totalGastos - prevTotal) / prevTotal) * 100 : 0

  // Category breakdown
  const byCategory = React.useMemo(() => {
    const map: Partial<Record<CompanyCategory, number>> = {}
    for (const e of filtered) {
      const cat = e as { value: number; date: string; recurrence: string; category: CompanyCategory }
      map[cat.category] = (map[cat.category] ?? 0) + cat.value
    }
    return map
  }, [filtered])

  const categoryData = React.useMemo(() => {
    return Object.entries(byCategory)
      .map(([cat, val]) => ({
        category: cat as CompanyCategory,
        label: COMPANY_CATEGORIES[cat as CompanyCategory] ?? cat,
        value: val as number,
        percentage: totalGastos > 0 ? ((val as number) / totalGastos) * 100 : 0,
        color: COMPANY_CATEGORY_COLORS[cat as CompanyCategory] ?? "#9CA3AF",
      }))
      .sort((a, b) => b.value - a.value)
  }, [byCategory, totalGastos])

  const topCategory = categoryData[0] ?? null

  // Monthly average (from MONTHLY_DATA last 6 months)
  const last6Months = MONTHLY_DATA.slice(-6)
  const avgMensal =
    last6Months.reduce((acc, m) => acc + m.gastos_empresa, 0) / last6Months.length

  // Fixed costs % (recorrencia fixo_mensal or fixo_anual)
  const fixedCosts = filtered.reduce((acc, e) => {
    const exp = e as { value: number; recurrence: string }
    return exp.recurrence === "fixo_mensal" || exp.recurrence === "fixo_anual"
      ? acc + exp.value
      : acc
  }, 0)
  const fixedPct = totalGastos > 0 ? (fixedCosts / totalGastos) * 100 : 0

  // Highest single expense
  const highestExpense = React.useMemo(() => {
    if (filtered.length === 0) return null
    return filtered.reduce((max, e) => (e.value > max.value ? e : max), filtered[0]) as unknown as {
      value: number
      title: string
      category: CompanyCategory
    }
  }, [filtered])

  // Stacked bar chart: last 6 months by category
  const stackedBarData = React.useMemo(() => {
    const allCategories = Object.keys(COMPANY_CATEGORIES) as CompanyCategory[]
    return last6Months.map((monthData) => {
      // Approximate split proportionally from MONTHLY_DATA total
      const total = monthData.gastos_empresa
      const row: Record<string, number | string> = { month: monthData.month }
      // Use current period's category distribution as proxy
      if (totalGastos > 0) {
        for (const cat of allCategories) {
          const pct = (byCategory[cat] ?? 0) / totalGastos
          row[COMPANY_CATEGORIES[cat]] = Math.round(total * pct)
        }
      } else {
        // Fallback even split
        for (const cat of allCategories) {
          row[COMPANY_CATEGORIES[cat]] = 0
        }
      }
      return row
    })
  }, [last6Months, byCategory, totalGastos])

  // ─── Insights ──────────────────────────────────────────────────────

  const insights = React.useMemo(() => {
    const list: { text: string; type: "positive" | "negative" | "neutral" }[] = []

    if (topCategory) {
      list.push({
        text: `A categoria "${topCategory.label}" representa ${topCategory.percentage.toFixed(1)}% dos gastos totais do período, com ${formatCurrency(topCategory.value)}.`,
        type: topCategory.percentage > 50 ? "negative" : "neutral",
      })
    }

    if (activePeriod === "mes_atual" || activePeriod === "total") {
      const trend = variacao
      if (Math.abs(trend) > 0.5) {
        list.push({
          text:
            trend > 0
              ? `Os gastos aumentaram ${trend.toFixed(1)}% em relação ao período anterior — atenção ao orçamento.`
              : `Os gastos reduziram ${Math.abs(trend).toFixed(1)}% em relação ao período anterior — bom controle financeiro.`,
          type: trend > 0 ? "negative" : "positive",
        })
      }
    }

    list.push({
      text: `Custos fixos representam ${fixedPct.toFixed(1)}% do total (${formatCurrency(fixedCosts)}). ${fixedPct > 70 ? "Alta previsibilidade, mas pouca flexibilidade orçamentária." : "Boa distribuição entre fixos e variáveis."}`,
      type: fixedPct > 80 ? "negative" : fixedPct > 60 ? "neutral" : "positive",
    })

    if (highestExpense) {
      list.push({
        text: `O maior gasto individual é "${highestExpense.title}" com ${formatCurrency(highestExpense.value)} — categoria ${COMPANY_CATEGORIES[highestExpense.category]}.`,
        type: "neutral",
      })
    }

    return list
  }, [topCategory, variacao, fixedPct, fixedCosts, highestExpense, activePeriod])

  // ─── Render ────────────────────────────────────────────────────────

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.07, duration: 0.35, ease: "easeOut" as const },
    }),
  }

  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Page Header + Period Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Análise Geral</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visão completa dos gastos da empresa
          </p>
        </div>

        {/* Period Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {PERIOD_PILLS.map((pill) => (
            <button
              key={pill.value}
              onClick={() => setActivePeriod(pill.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap",
                activePeriod === pill.value
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Total Gastos Empresa",
            value: formatCurrency(totalGastos),
            sub: `${filtered.length} lançamento${filtered.length !== 1 ? "s" : ""}`,
            accent: "text-foreground",
          },
          {
            label: "Maior Categoria",
            value: topCategory?.label ?? "—",
            sub: topCategory ? formatCurrency(topCategory.value) : "Sem dados",
            accent: "text-primary",
          },
          {
            label: "Média Mensal",
            value: formatCurrency(avgMensal),
            sub: "Últimos 6 meses",
            accent: "text-foreground",
          },
          {
            label: "Variação vs Anterior",
            value:
              prevTotal > 0
                ? `${variacao >= 0 ? "+" : ""}${variacao.toFixed(1)}%`
                : "—",
            sub:
              activePeriod === "mes_atual"
                ? "vs mês passado"
                : prevTotal > 0
                  ? `${formatCurrency(prevTotal)} antes`
                  : "Sem período anterior",
            accent:
              variacao > 0
                ? "text-red-500"
                : variacao < 0
                  ? "text-green-500"
                  : "text-muted-foreground",
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="bg-card border border-border rounded-xl p-5"
          >
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
              {card.label}
            </p>
            <p className={cn("text-2xl font-bold truncate", card.accent)}>
              {card.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Row 2: Donut Chart + Ranked List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.4 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <h2 className="text-base font-semibold text-foreground mb-6">
          Distribuição por Categoria
        </h2>

        {totalGastos === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            Sem dados para o período selecionado
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Donut */}
            <div className="flex-shrink-0 w-full lg:w-auto" style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {categoryData.map((entry) => (
                      <Cell key={entry.category} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomDonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Ranked List */}
            <div className="flex-1 w-full space-y-3">
              {categoryData.map((item, idx) => (
                <div key={item.category} className="flex items-center gap-3">
                  <span className="w-6 text-center text-xs font-bold text-muted-foreground shrink-0">
                    #{idx + 1}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ background: item.color }}
                  />
                  <span className="flex-1 text-sm text-foreground font-medium truncate">
                    {item.label}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0 w-10 text-right">
                    {item.percentage.toFixed(1)}%
                  </span>
                  <span className="text-sm font-semibold text-foreground shrink-0 w-28 text-right">
                    {formatCurrency(item.value)}
                  </span>
                  {/* Bar */}
                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden shrink-0">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.percentage}%`,
                        background: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Row 3: Stacked Bar + Top 5 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Stacked Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="text-base font-semibold text-foreground mb-6">
            Evolução por Categoria (Últimos 6 meses)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={stackedBarData}
              margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                width={36}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }}
              />
              {(Object.keys(COMPANY_CATEGORIES) as CompanyCategory[]).map(
                (cat) => (
                  <Bar
                    key={cat}
                    dataKey={COMPANY_CATEGORIES[cat]}
                    stackId="a"
                    fill={COMPANY_CATEGORY_COLORS[cat]}
                    radius={
                      cat === "outros"
                        ? [4, 4, 0, 0]
                        : [0, 0, 0, 0]
                    }
                  />
                )
              )}
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top 5 Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.4 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="text-base font-semibold text-foreground mb-6">
            Top 5 Categorias
          </h2>

          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              Sem dados para o período
            </div>
          ) : (
            <div className="space-y-5">
              {categoryData.slice(0, 5).map((item, idx) => (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">
                        #{idx + 1}
                      </span>
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ background: item.color }}
                      />
                      <span className="text-sm font-medium text-foreground truncate">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="text-xs text-muted-foreground">
                        {item.percentage.toFixed(1)}%
                      </span>
                      <span className="text-sm font-bold text-foreground w-28 text-right">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: item.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ delay: 0.5 + idx * 0.08, duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Row 4: Insights Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="bg-[#0F0F1A] border border-border/50 rounded-xl p-6 dark:bg-card"
      >
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <h2 className="text-base font-semibold text-white dark:text-foreground">
            Insights Automáticos
          </h2>
        </div>

        <div className="space-y-3">
          {insights.map((insight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + idx * 0.1, duration: 0.35 }}
              className="flex items-start gap-3"
            >
              <span className="mt-1 shrink-0">
                {insight.type === "positive" ? (
                  <TrendingDown className="w-4 h-4 text-green-400" />
                ) : insight.type === "negative" ? (
                  <TrendingUp className="w-4 h-4 text-red-400" />
                ) : (
                  <Minus className="w-4 h-4 text-blue-400" />
                )}
              </span>
              <p
                className={cn(
                  "text-sm leading-relaxed",
                  insight.type === "positive"
                    ? "text-green-300"
                    : insight.type === "negative"
                      ? "text-red-300"
                      : "text-slate-300 dark:text-muted-foreground"
                )}
              >
                {insight.text}
              </p>
            </motion.div>
          ))}

          {insights.length === 0 && (
            <p className="text-sm text-slate-400">
              Selecione um período com dados para ver os insights.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
