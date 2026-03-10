"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Plus, CreditCard, Repeat2, Wallet, TrendingDown } from "lucide-react"
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
} from "recharts"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/shared/confirm-modal"
import { PersonalList } from "@/components/personal/personal-list"
import { PersonalForm } from "@/components/personal/personal-form"

import { usePersonalStore } from "@/lib/store"
import { PERSONAL_CATEGORIES, MONTHLY_DATA } from "@/lib/data"
import { formatCurrency } from "@/lib/formatters"
import type { PersonalExpense } from "@/lib/types"

// ─── Category colors ─────────────────────────────────────────────────
const PERSONAL_CATEGORY_COLORS: Record<string, string> = {
  dividas_emprestimos: '#FF1744',
  gastos_mensais_fixos: '#F59E0B',
  cartao_credito: '#8B5CF6',
  dividas_pessoais: '#FF5252',
  lazer_entretenimento: '#06B6D4',
  saude: '#10B981',
  alimentacao: '#F97316',
  outros: '#6366F1',
}

// ─── Helpers ─────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
  index,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  color: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="rounded-2xl border border-border bg-card p-4 flex items-start gap-4"
    >
      <div
        className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
        style={{ backgroundColor: color + "22" }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-foreground mt-0.5 truncate">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  )
}

interface PieTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { color: string } }>
}

function CustomPieTooltip({ active, payload }: PieTooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-xl border border-border bg-card/95 backdrop-blur px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground">{item.name}</p>
      <p className="text-sm font-bold text-foreground">{formatCurrency(item.value)}</p>
    </div>
  )
}

interface BarTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomBarTooltip({ active, payload, label }: BarTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-card/95 backdrop-blur px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-bold text-[#FF1744]">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────

export default function GastosPessoaisPage() {
  const { expenses, deleteExpense } = usePersonalStore()

  const [formOpen, setFormOpen] = React.useState(false)
  const [editExpense, setEditExpense] = React.useState<PersonalExpense | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  // ── Summary stats ────────────────────────────────────────────────

  const debtExpenses = expenses.filter(
    (e) => e.category === "dividas_emprestimos" || e.category === "dividas_pessoais"
  )
  const fixedExpenses = expenses.filter((e) => e.recurrence !== "unico")
  const creditCardExpenses = expenses.filter((e) => e.category === "cartao_credito")

  const totalDebts = debtExpenses.reduce((acc, e) => acc + e.value, 0)
  const totalFixed = fixedExpenses.reduce((acc, e) => acc + e.value, 0)
  const totalCreditCard = creditCardExpenses.reduce((acc, e) => acc + e.value, 0)
  const totalAll = expenses.reduce((acc, e) => acc + e.value, 0)

  // ── Pie chart data ───────────────────────────────────────────────

  const pieData = React.useMemo(() => {
    const byCategory: Record<string, number> = {}
    for (const e of expenses) {
      byCategory[e.category] = (byCategory[e.category] ?? 0) + e.value
    }
    return Object.entries(byCategory)
      .map(([key, value]) => ({
        name: PERSONAL_CATEGORIES[key as keyof typeof PERSONAL_CATEGORIES] ?? key,
        value,
        color: PERSONAL_CATEGORY_COLORS[key] ?? "#6366F1",
      }))
      .sort((a, b) => b.value - a.value)
  }, [expenses])

  // ── Bar chart data (monthly personal) ───────────────────────────

  const barData = MONTHLY_DATA.slice(-6).map((d) => ({
    month: d.month,
    gastos: d.gastos_pessoais,
  }))

  // ── Handlers ─────────────────────────────────────────────────────

  function handleDelete(id: string) {
    deleteExpense(id)
    toast.success("Gasto excluído com sucesso!")
    setDeleteId(null)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gastos Pessoais</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Controle suas despesas pessoais, dívidas e parcelas
          </p>
        </div>
        <Button
          onClick={() => { setEditExpense(null); setFormOpen(true) }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Adicionar Gasto
        </Button>
      </motion.div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          index={0}
          label="Total dívidas ativas"
          value={formatCurrency(totalDebts)}
          sub={`${debtExpenses.length} dívida${debtExpenses.length !== 1 ? "s" : ""}`}
          icon={<TrendingDown className="h-5 w-5" />}
          color="#FF1744"
        />
        <StatCard
          index={1}
          label="Gastos fixos mensais"
          value={formatCurrency(totalFixed)}
          sub={`${fixedExpenses.length} lançamento${fixedExpenses.length !== 1 ? "s" : ""}`}
          icon={<Repeat2 className="h-5 w-5" />}
          color="#F59E0B"
        />
        <StatCard
          index={2}
          label="Cartão de crédito"
          value={formatCurrency(totalCreditCard)}
          sub={`${creditCardExpenses.length} fatura${creditCardExpenses.length !== 1 ? "s" : ""}`}
          icon={<CreditCard className="h-5 w-5" />}
          color="#8B5CF6"
        />
        <StatCard
          index={3}
          label="Total geral"
          value={formatCurrency(totalAll)}
          sub={`${expenses.length} lançamento${expenses.length !== 1 ? "s" : ""}`}
          icon={<Wallet className="h-5 w-5" />}
          color="#06B6D4"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <h2 className="text-sm font-semibold text-foreground mb-4">Gastos por Categoria</h2>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-52 text-muted-foreground text-sm">
              Sem dados disponíveis
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-full md:w-52 h-52 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={88}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1.5 w-full min-w-0">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-muted-foreground truncate">{item.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground whitespace-nowrap flex-shrink-0">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Evolução Mensal de Gastos Pessoais
          </h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barSize={28} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255,255,255,0.06)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
                  }
                  width={40}
                />
                <Tooltip
                  content={<CustomBarTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar
                  dataKey="gastos"
                  fill="#FF1744"
                  radius={[6, 6, 0, 0]}
                  fillOpacity={0.85}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Full list */}
      <PersonalList
        onAddClick={() => { setEditExpense(null); setFormOpen(true) }}
      />

      {/* Add / Edit form */}
      <PersonalForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditExpense(null) }}
        editExpense={editExpense}
      />

      {/* Delete confirm */}
      <ConfirmModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Excluir gasto"
        description="Tem certeza que deseja excluir este gasto? Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        variant="destructive"
      />
    </div>
  )
}
