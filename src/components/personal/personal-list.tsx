"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Download,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Receipt,
} from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmModal } from "@/components/shared/confirm-modal"
import { DebtCard } from "@/components/personal/debt-card"
import { PersonalForm } from "@/components/personal/personal-form"

import { usePersonalStore } from "@/lib/store"
import { PERSONAL_CATEGORIES, PERSONAL_CATEGORY_COLORS } from "@/lib/data"
import { formatCurrency, formatDateShort } from "@/lib/formatters"
import { RECURRENCE_LABELS } from "@/lib/types"
import type { PersonalExpense, PersonalCategory } from "@/lib/types"

const DEBT_CATEGORIES: PersonalCategory[] = ["dividas_emprestimos", "dividas_pessoais"]

interface PersonalListProps {
  onAddClick: () => void
}

type SortField = "date" | "value" | "title"
type SortDir = "asc" | "desc"

function exportToCSV(expenses: PersonalExpense[]) {
  const header = ["Título", "Categoria", "Valor", "Data", "Recorrência", "Observações"]
  const rows = expenses.map((e) => [
    `"${e.title}"`,
    `"${PERSONAL_CATEGORIES[e.category] ?? e.category}"`,
    e.value.toString(),
    e.date,
    RECURRENCE_LABELS[e.recurrence],
    `"${e.notes ?? ""}"`,
  ])
  const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "gastos-pessoais.csv"
  a.click()
  URL.revokeObjectURL(url)
}

export function PersonalList({ onAddClick }: PersonalListProps) {
  const { expenses, deleteExpense } = usePersonalStore()

  // Local state
  const [search, setSearch] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState<"all" | PersonalCategory>("all")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [valueMin, setValueMin] = React.useState("")
  const [valueMax, setValueMax] = React.useState("")
  const [showFilters, setShowFilters] = React.useState(false)
  const [sortField, setSortField] = React.useState<SortField>("date")
  const [sortDir, setSortDir] = React.useState<SortDir>("desc")
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [editExpense, setEditExpense] = React.useState<PersonalExpense | null>(null)
  const [formOpen, setFormOpen] = React.useState(false)

  // Separate debts from regular
  const debtExpenses = expenses.filter((e) => DEBT_CATEGORIES.includes(e.category))
  const regularExpenses = expenses.filter((e) => !DEBT_CATEGORIES.includes(e.category))

  // Filter regular expenses
  const filtered = React.useMemo(() => {
    let list = [...regularExpenses]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (PERSONAL_CATEGORIES[e.category] ?? "").toLowerCase().includes(q)
      )
    }

    if (categoryFilter !== "all") {
      list = list.filter((e) => e.category === categoryFilter)
    }

    if (dateFrom) {
      list = list.filter((e) => e.date >= dateFrom)
    }
    if (dateTo) {
      list = list.filter((e) => e.date <= dateTo)
    }

    if (valueMin) {
      list = list.filter((e) => e.value >= parseFloat(valueMin))
    }
    if (valueMax) {
      list = list.filter((e) => e.value <= parseFloat(valueMax))
    }

    list.sort((a, b) => {
      let cmp = 0
      if (sortField === "date") {
        cmp = a.date.localeCompare(b.date)
      } else if (sortField === "value") {
        cmp = a.value - b.value
      } else if (sortField === "title") {
        cmp = a.title.localeCompare(b.title, "pt-BR")
      }
      return sortDir === "asc" ? cmp : -cmp
    })

    return list
  }, [regularExpenses, search, categoryFilter, dateFrom, dateTo, valueMin, valueMax, sortField, sortDir])

  function handleDelete(id: string) {
    deleteExpense(id)
    toast.success("Gasto excluído com sucesso!")
    setDeleteId(null)
  }

  function handleEdit(expense: PersonalExpense) {
    setEditExpense(expense)
    setFormOpen(true)
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return null
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 ml-1 inline" />
    ) : (
      <ChevronDown className="h-3 w-3 ml-1 inline" />
    )
  }

  return (
    <div className="space-y-6">
      {/* Debt section */}
      {debtExpenses.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-[#FF1744]" />
            <h2 className="text-sm font-semibold text-foreground">Dívidas Ativas</h2>
            <Badge
              className="text-xs"
              style={{ backgroundColor: "#FF174422", color: "#FF1744", borderColor: "#FF174444" }}
            >
              {debtExpenses.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {debtExpenses.map((expense) => (
              <DebtCard
                key={expense.id}
                expense={expense}
                onEdit={() => handleEdit(expense)}
                onDelete={() => setDeleteId(expense.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Filter bar */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título ou categoria..."
              className="pl-9 bg-background border-border text-foreground"
            />
          </div>

          <Select
            value={categoryFilter}
            onValueChange={(v) => setCategoryFilter(v as "all" | PersonalCategory)}
          >
            <SelectTrigger className="w-full sm:w-52 bg-background border-border text-foreground">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all" className="text-foreground cursor-pointer">
                Todas as categorias
              </SelectItem>
              {Object.entries(PERSONAL_CATEGORIES)
                .filter(([key]) => !DEBT_CATEGORIES.includes(key as PersonalCategory))
                .map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-foreground cursor-pointer">
                    {label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-muted cursor-pointer gap-1.5"
              onClick={() => setShowFilters((v) => !v)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-muted cursor-pointer gap-1.5"
              onClick={() => exportToCSV(filtered)}
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Data inicial</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="bg-background border-border text-foreground text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Data final</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="bg-background border-border text-foreground text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Valor mínimo</label>
                  <Input
                    type="number"
                    min="0"
                    value={valueMin}
                    onChange={(e) => setValueMin(e.target.value)}
                    placeholder="R$ 0"
                    className="bg-background border-border text-foreground text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Valor máximo</label>
                  <Input
                    type="number"
                    min="0"
                    value={valueMax}
                    onChange={(e) => setValueMax(e.target.value)}
                    placeholder="R$ 99.999"
                    className="bg-background border-border text-foreground text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground cursor-pointer text-xs"
                  onClick={() => {
                    setDateFrom("")
                    setDateTo("")
                    setValueMin("")
                    setValueMax("")
                    setCategoryFilter("all")
                    setSearch("")
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Regular expenses list */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-4 py-2.5 border-b border-border bg-muted/30 text-xs text-muted-foreground font-medium">
          <button
            className="text-left hover:text-foreground transition-colors cursor-pointer flex items-center"
            onClick={() => handleSort("title")}
          >
            Título
            <SortIcon field="title" />
          </button>
          <span className="hidden sm:block">Categoria</span>
          <span className="hidden sm:block">Recorrência</span>
          <button
            className="hover:text-foreground transition-colors cursor-pointer flex items-center"
            onClick={() => handleSort("date")}
          >
            Data
            <SortIcon field="date" />
          </button>
          <button
            className="hover:text-foreground transition-colors cursor-pointer flex items-center"
            onClick={() => handleSort("value")}
          >
            Valor
            <SortIcon field="value" />
          </button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Receipt />}
            title="Nenhum gasto encontrado"
            description="Nenhum gasto pessoal corresponde aos filtros aplicados. Tente ajustar a busca ou adicionar um novo gasto."
            action={{ label: "Adicionar Gasto", onClick: onAddClick }}
          />
        ) : (
          <div className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {filtered.map((expense) => {
                const color = PERSONAL_CATEGORY_COLORS[expense.category] ?? "#6366F1"
                const categoryLabel = PERSONAL_CATEGORIES[expense.category] ?? expense.category
                const recurrenceLabel = RECURRENCE_LABELS[expense.recurrence]

                return (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-center px-4 py-3 hover:bg-muted/20 transition-colors"
                  >
                    {/* Title + dot */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium text-sm text-foreground truncate">
                        {expense.title}
                      </span>
                    </div>

                    {/* Category badge */}
                    <div className="hidden sm:block">
                      <Badge
                        className="text-xs whitespace-nowrap"
                        style={{
                          backgroundColor: color + "22",
                          color,
                          borderColor: color + "44",
                        }}
                      >
                        {categoryLabel}
                      </Badge>
                    </div>

                    {/* Recurrence badge */}
                    <div className="hidden sm:block">
                      <Badge variant="outline" className="text-xs text-muted-foreground border-border whitespace-nowrap">
                        {recurrenceLabel}
                      </Badge>
                    </div>

                    {/* Date */}
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateShort(expense.date)}
                    </span>

                    {/* Value + actions */}
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-[#FF1744] whitespace-nowrap">
                        {formatCurrency(expense.value)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() => handleEdit(expense)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-[#FF1744] cursor-pointer"
                        onClick={() => setDeleteId(expense.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Footer total */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <span className="text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "item" : "itens"}
            </span>
            <span className="text-sm font-bold text-[#FF1744]">
              Total: {formatCurrency(filtered.reduce((acc, e) => acc + e.value, 0))}
            </span>
          </div>
        )}
      </div>

      {/* Edit form */}
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
