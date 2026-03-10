"use client"

import * as React from "react"
import { Pencil, Trash2, Plus, Download, ChevronUp, ChevronDown, ChevronsUpDown, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmModal } from "@/components/shared/confirm-modal"

import { useCompanyStore } from "@/lib/store"
import { COMPANY_CATEGORIES, COMPANY_CATEGORY_COLORS } from "@/lib/data"
import { formatCurrency, formatDateShort } from "@/lib/formatters"
import type { CompanyExpense, CompanyCategory, RecurrenceType } from "@/lib/types"

// ─── Props ────────────────────────────────────────────────────────────

interface ExpenseListProps {
  onAddClick: () => void
  onEditClick: (expense: CompanyExpense) => void
}

// ─── Sort types ───────────────────────────────────────────────────────

type SortField = "title" | "date" | "value" | "category"
type SortDir = "asc" | "desc"

// ─── Recurrence badge colors ──────────────────────────────────────────

const RECURRENCE_BADGE: Record<RecurrenceType, { label: string; className: string }> = {
  unico: {
    label: "Único",
    className: "bg-muted text-muted-foreground border border-border",
  },
  fixo_mensal: {
    label: "Fixo Mensal",
    className: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  },
  fixo_anual: {
    label: "Fixo Anual",
    className: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
  },
}

// ─── Sort icon ────────────────────────────────────────────────────────

function SortIcon({ field, sort }: { field: SortField; sort: { field: SortField; dir: SortDir } }) {
  if (sort.field !== field) return <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
  if (sort.dir === "asc") return <ChevronUp className="w-3.5 h-3.5" />
  return <ChevronDown className="w-3.5 h-3.5" />
}

// ─── CSV export ───────────────────────────────────────────────────────

function exportToCSV(expenses: CompanyExpense[]) {
  const headers = ["Título", "Categoria", "Valor", "Data", "Recorrência", "Observações", "Anexo"]
  const rows = expenses.map((e) => [
    `"${e.title.replace(/"/g, '""')}"`,
    `"${COMPANY_CATEGORIES[e.category]}"`,
    String(e.value),
    e.date,
    e.recurrence === "unico" ? "Único" : e.recurrence === "fixo_mensal" ? "Fixo Mensal" : "Fixo Anual",
    `"${(e.notes ?? "").replace(/"/g, '""')}"`,
    `"${(e.attachment ?? "").replace(/"/g, '""')}"`,
  ])

  const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n")
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `gastos-empresa-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Component ────────────────────────────────────────────────────────

export function ExpenseList({ onAddClick, onEditClick }: ExpenseListProps) {
  const expenses = useCompanyStore((s) => s.expenses)
  const deleteExpense = useCompanyStore((s) => s.deleteExpense)

  // ─── Filter state ────────────────────────────────────────────────

  const [search, setSearch] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState<CompanyCategory | "todas">("todas")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [minValue, setMinValue] = React.useState("")
  const [maxValue, setMaxValue] = React.useState("")
  const [sort, setSort] = React.useState<{ field: SortField; dir: SortDir }>({
    field: "date",
    dir: "desc",
  })

  // ─── Delete confirm state ────────────────────────────────────────

  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const deleteTarget = expenses.find((e) => e.id === deleteId)

  // ─── Filter logic ────────────────────────────────────────────────

  const filtered = React.useMemo(() => {
    let result = [...expenses]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((e) => e.title.toLowerCase().includes(q))
    }

    if (categoryFilter !== "todas") {
      result = result.filter((e) => e.category === categoryFilter)
    }

    if (dateFrom) {
      result = result.filter((e) => e.date >= dateFrom)
    }

    if (dateTo) {
      result = result.filter((e) => e.date <= dateTo)
    }

    if (minValue) {
      const min = parseFloat(minValue)
      if (!isNaN(min)) result = result.filter((e) => e.value >= min)
    }

    if (maxValue) {
      const max = parseFloat(maxValue)
      if (!isNaN(max)) result = result.filter((e) => e.value <= max)
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      if (sort.field === "title") cmp = a.title.localeCompare(b.title, "pt-BR")
      else if (sort.field === "date") cmp = a.date.localeCompare(b.date)
      else if (sort.field === "value") cmp = a.value - b.value
      else if (sort.field === "category") cmp = a.category.localeCompare(b.category)
      return sort.dir === "asc" ? cmp : -cmp
    })

    return result
  }, [expenses, search, categoryFilter, dateFrom, dateTo, minValue, maxValue, sort])

  // ─── Fixed expenses ──────────────────────────────────────────────

  const fixedExpenses = React.useMemo(
    () => filtered.filter((e) => e.recurrence !== "unico"),
    [filtered]
  )

  const oneTimeExpenses = React.useMemo(
    () => filtered.filter((e) => e.recurrence === "unico"),
    [filtered]
  )

  // ─── Helpers ─────────────────────────────────────────────────────

  function toggleSort(field: SortField) {
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "asc" }
    )
  }

  function clearFilters() {
    setSearch("")
    setCategoryFilter("todas")
    setDateFrom("")
    setDateTo("")
    setMinValue("")
    setMaxValue("")
  }

  const hasActiveFilters =
    search || categoryFilter !== "todas" || dateFrom || dateTo || minValue || maxValue

  // ─── Single row ──────────────────────────────────────────────────

  function ExpenseRow({ expense }: { expense: CompanyExpense }) {
    const color = COMPANY_CATEGORY_COLORS[expense.category]
    const badge = RECURRENCE_BADGE[expense.recurrence]
    const categoryLabel = COMPANY_CATEGORIES[expense.category]

    return (
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors group rounded-lg">
        {/* Color dot + title */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-medium text-foreground truncate">
            {expense.title}
          </span>
        </div>

        {/* Category badge */}
        <span
          className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
          style={{
            backgroundColor: color + "20",
            color: color,
            border: `1px solid ${color}30`,
          }}
        >
          {categoryLabel}
        </span>

        {/* Recurrence badge */}
        <span
          className={`hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${badge.className}`}
        >
          {badge.label}
        </span>

        {/* Date */}
        <span className="hidden lg:block text-xs text-muted-foreground flex-shrink-0 w-24 text-right">
          {formatDateShort(expense.date)}
        </span>

        {/* Value */}
        <span className="text-sm font-semibold text-red-400 flex-shrink-0 w-28 text-right">
          {formatCurrency(expense.value)}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            onClick={() => onEditClick(expense)}
            title="Editar gasto"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            onClick={() => setDeleteId(expense.id)}
            title="Excluir gasto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    )
  }

  // ─── Column header ───────────────────────────────────────────────

  function ColHeader({ field, label, className = "" }: { field: SortField; label: string; className?: string }) {
    return (
      <button
        onClick={() => toggleSort(field)}
        className={`flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer ${className}`}
      >
        {label}
        <SortIcon field={field} sort={sort} />
      </button>
    )
  }

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Top bar: Export + Add */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Todos os Gastos</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(filtered)}
            className="border-border text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Button>
          <Button
            size="sm"
            onClick={onAddClick}
            className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Adicionar</span>
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <Card className="bg-card border-border">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Buscar por título…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Category */}
            <Select
              value={categoryFilter}
              onValueChange={(v) => setCategoryFilter(v as CompanyCategory | "todas")}
            >
              <SelectTrigger className="w-[200px] bg-background border-border text-foreground">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="todas" className="text-foreground hover:bg-muted cursor-pointer">
                  Todas as categorias
                </SelectItem>
                {(Object.entries(COMPANY_CATEGORIES) as [CompanyCategory, string][]).map(
                  ([key, label]) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="text-foreground hover:bg-muted cursor-pointer"
                    >
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            {/* Date from */}
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[150px] bg-background border-border text-foreground"
              title="Data de"
            />

            {/* Date to */}
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[150px] bg-background border-border text-foreground"
              title="Data até"
            />

            {/* Min value */}
            <Input
              type="number"
              placeholder="Valor mín."
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              className="w-[120px] bg-background border-border text-foreground placeholder:text-muted-foreground"
              min="0"
            />

            {/* Max value */}
            <Input
              type="number"
              placeholder="Valor máx."
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
              className="w-[120px] bg-background border-border text-foreground placeholder:text-muted-foreground"
              min="0"
            />

            {/* Clear filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
                Limpar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fixed expenses section */}
      {fixedExpenses.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Gastos Fixos
              </CardTitle>
              <span className="text-sm font-semibold text-red-400">
                {formatCurrency(fixedExpenses.reduce((acc, e) => acc + e.value, 0))}
                <span className="text-xs text-muted-foreground font-normal ml-1">total</span>
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            {/* Column headers */}
            <div className="flex items-center gap-3 px-4 py-1.5 mb-1">
              <ColHeader field="title" label="Título" className="flex-1" />
              <div className="hidden sm:block w-32" />
              <div className="hidden md:block w-28" />
              <ColHeader field="date" label="Data" className="hidden lg:flex w-24 justify-end" />
              <ColHeader field="value" label="Valor" className="w-28 justify-end" />
              <div className="w-16" />
            </div>
            <div className="space-y-0.5">
              {fixedExpenses.map((expense) => (
                <ExpenseRow key={expense.id} expense={expense} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full expense list */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground">
              {oneTimeExpenses.length > 0 ? "Gastos Únicos" : "Lista de Gastos"}
              {filtered.length > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({filtered.length} {filtered.length === 1 ? "item" : "itens"})
                </span>
              )}
            </CardTitle>
            {filtered.length > 0 && (
              <span className="text-sm font-semibold text-red-400">
                {formatCurrency(
                  (oneTimeExpenses.length > 0 ? oneTimeExpenses : filtered).reduce(
                    (acc, e) => acc + e.value,
                    0
                  )
                )}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-2 pb-3">
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Plus />}
              title="Nenhum gasto encontrado"
              description={
                hasActiveFilters
                  ? "Nenhum gasto corresponde aos filtros aplicados. Tente ajustar os critérios de busca."
                  : "Nenhum gasto cadastrado ainda. Clique em 'Adicionar Gasto' para começar."
              }
              action={
                hasActiveFilters
                  ? { label: "Limpar filtros", onClick: clearFilters }
                  : { label: "Adicionar Gasto", onClick: onAddClick }
              }
            />
          ) : (
            <>
              {/* Column headers */}
              <div className="flex items-center gap-3 px-4 py-1.5 mb-1">
                <ColHeader field="title" label="Título" className="flex-1" />
                <div className="hidden sm:block w-32" />
                <div className="hidden md:block w-28" />
                <ColHeader field="date" label="Data" className="hidden lg:flex w-24 justify-end" />
                <ColHeader field="value" label="Valor" className="w-28 justify-end" />
                <div className="w-16" />
              </div>
              <div className="space-y-0.5">
                {(oneTimeExpenses.length > 0 ? oneTimeExpenses : filtered).map((expense) => (
                  <ExpenseRow key={expense.id} expense={expense} />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete confirm modal */}
      <ConfirmModal
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteExpense(deleteId)
          setDeleteId(null)
        }}
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
