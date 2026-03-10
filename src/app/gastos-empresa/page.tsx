"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SkeletonCard } from "@/components/shared/skeleton-card"
import { ConfirmModal } from "@/components/shared/confirm-modal"

import { ExpenseForm } from "@/components/company/expense-form"
import { ExpenseList } from "@/components/company/expense-list"
import { CompanyCharts } from "@/components/company/company-charts"

import { useCompanyStore } from "@/lib/store"
import { COMPANY_CATEGORIES, COMPANY_CATEGORY_COLORS } from "@/lib/data"
import { formatCurrency, formatDateShort } from "@/lib/formatters"
import type { CompanyExpense } from "@/lib/types"

// ─── Recurrence badge helpers ─────────────────────────────────────────

const RECURRENCE_BADGE = {
  fixo_mensal: {
    label: "Fixo Mensal",
    className: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  },
  fixo_anual: {
    label: "Fixo Anual",
    className: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
  },
} as const

// ─── Page Component ───────────────────────────────────────────────────

export default function GastosEmpresaPage() {
  const expenses = useCompanyStore((s) => s.expenses)
  const deleteExpense = useCompanyStore((s) => s.deleteExpense)

  // ─── Loading state (simulated) ──────────────────────────────────

  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // ─── UI state ───────────────────────────────────────────────────

  const [formOpen, setFormOpen] = React.useState(false)
  const [editExpense, setEditExpense] = React.useState<CompanyExpense | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  // ─── Derived data ────────────────────────────────────────────────

  const fixedExpenses = React.useMemo(
    () => expenses.filter((e) => e.recurrence !== "unico"),
    [expenses]
  )

  const fixedMonthlyTotal = React.useMemo(
    () =>
      fixedExpenses
        .filter((e) => e.recurrence === "fixo_mensal")
        .reduce((acc, e) => acc + e.value, 0),
    [fixedExpenses]
  )

  const deleteTarget = expenses.find((e) => e.id === deleteId)

  // ─── Handlers ────────────────────────────────────────────────────

  function handleAddClick() {
    setEditExpense(null)
    setFormOpen(true)
  }

  function handleEditClick(expense: CompanyExpense) {
    setEditExpense(expense)
    setFormOpen(true)
  }

  function handleFormClose() {
    setFormOpen(false)
    setEditExpense(null)
  }

  function handleDeleteConfirm() {
    if (!deleteId) return
    deleteExpense(deleteId)
    toast.success("Gasto excluído com sucesso!")
    setDeleteId(null)
  }

  // ─── Loading skeletons ───────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
          <div className="h-9 w-36 rounded-md bg-muted animate-pulse" />
        </div>
        {/* Card skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard />
      </div>
    )
  }

  // ─── Full render ─────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gastos da Empresa</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie todos os gastos e despesas empresariais
          </p>
        </div>
        <Button
          onClick={handleAddClick}
          className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Adicionar Gasto
        </Button>
      </div>

      {/* Charts section */}
      <CompanyCharts />

      {/* Fixed expenses card */}
      {fixedExpenses.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Gastos Fixos Recorrentes
              </CardTitle>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total mensal</p>
                <p className="text-sm font-bold text-red-400">
                  {formatCurrency(fixedMonthlyTotal)}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {fixedExpenses.map((expense) => {
                const color = COMPANY_CATEGORY_COLORS[expense.category]
                const badge = RECURRENCE_BADGE[expense.recurrence as keyof typeof RECURRENCE_BADGE]

                return (
                  <div
                    key={expense.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    {/* Color indicator + title */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {expense.title}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color }}
                        >
                          {COMPANY_CATEGORIES[expense.category]}
                        </p>
                      </div>
                    </div>

                    {/* Value per period */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-red-400">
                        {formatCurrency(expense.value)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {expense.recurrence === "fixo_mensal" ? "/mês" : "/ano"}
                      </p>
                    </div>

                    {/* Next due date */}
                    {expense.nextDueDate && (
                      <div className="text-right flex-shrink-0 hidden sm:block">
                        <p className="text-xs text-muted-foreground">Próximo venc.</p>
                        <p className="text-xs font-medium text-foreground">
                          {formatDateShort(expense.nextDueDate)}
                        </p>
                      </div>
                    )}

                    {/* Recurrence badge */}
                    {badge && (
                      <span
                        className={`hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    )}

                    {/* Edit button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditClick(expense)}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer text-xs px-2 flex-shrink-0"
                    >
                      Editar
                    </Button>
                  </div>
                )
              })}
            </div>

            {/* Total row */}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-medium">
                Total de custos fixos mensais
              </span>
              <span className="text-base font-bold text-red-400">
                {formatCurrency(fixedMonthlyTotal)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full expense list with filters */}
      <ExpenseList
        onAddClick={handleAddClick}
        onEditClick={handleEditClick}
      />

      {/* Add / Edit form sheet */}
      <ExpenseForm
        open={formOpen}
        onClose={handleFormClose}
        editExpense={editExpense}
      />

      {/* Delete confirm modal */}
      <ConfirmModal
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Excluir Gasto"
        description={
          deleteTarget
            ? `Tem certeza que deseja excluir "${deleteTarget.title}"? Esta ação não pode ser desfeita.`
            : "Tem certeza que deseja excluir este gasto?"
        }
        confirmLabel="Excluir"
        variant="destructive"
      />
    </div>
  )
}
