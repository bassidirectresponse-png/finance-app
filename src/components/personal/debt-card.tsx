"use client"

import * as React from "react"
import { Pencil, Trash2, CalendarClock, TrendingDown, CreditCard } from "lucide-react"
import { motion } from "framer-motion"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDateShort } from "@/lib/formatters"
import { PERSONAL_CATEGORIES } from "@/lib/data"
import type { PersonalExpense } from "@/lib/types"

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

interface DebtCardProps {
  expense: PersonalExpense
  onEdit: () => void
  onDelete: () => void
}

function calcPayoffDate(paidInstallments: number, totalInstallments: number): string {
  const remaining = totalInstallments - paidInstallments
  const payoff = new Date()
  payoff.setMonth(payoff.getMonth() + remaining)
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(payoff)
}

export function DebtCard({ expense, onEdit, onDelete }: DebtCardProps) {
  const isDebt =
    (expense.category === "dividas_emprestimos" ||
      expense.category === "dividas_pessoais") &&
    expense.totalInstallments != null &&
    expense.paidInstallments != null

  const categoryLabel = PERSONAL_CATEGORIES[expense.category] ?? expense.category
  const categoryColor = PERSONAL_CATEGORY_COLORS[expense.category] ?? "#6366F1"

  if (!isDebt) {
    // Fallback: render as regular card
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card overflow-hidden"
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: categoryColor }}
            />
            <div>
              <p className="font-semibold text-foreground text-sm">{expense.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDateShort(expense.date)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className="text-xs"
              style={{ backgroundColor: categoryColor + "22", color: categoryColor, borderColor: categoryColor + "44" }}
            >
              {categoryLabel}
            </Badge>
            <span className="font-bold text-[#FF1744] text-sm">
              {formatCurrency(expense.value)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={onEdit}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-[#FF1744] cursor-pointer"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  const paid = expense.paidInstallments!
  const total = expense.totalInstallments!
  const installmentValue = expense.installmentValue ?? expense.value
  const totalDebt = expense.totalDebt ?? installmentValue * total
  const remaining = total - paid
  const progressPercent = Math.round((paid / total) * 100)
  const payoffDate = calcPayoffDate(paid, total)
  const amountPaid = paid * installmentValue
  const amountRemaining = remaining * installmentValue

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border border-l-4 border-l-[#FF1744] bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="bg-red-950/20 px-4 py-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <CreditCard className="h-4 w-4 text-[#FF1744] flex-shrink-0" />
          <p className="font-semibold text-foreground text-sm truncate">{expense.title}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge
            className="text-xs whitespace-nowrap"
            style={{ backgroundColor: categoryColor + "22", color: categoryColor, borderColor: categoryColor + "44" }}
          >
            {categoryLabel}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-[#FF1744] cursor-pointer"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {paid} de {total} parcelas pagas
            </span>
            <span className="font-medium text-foreground">{progressPercent}%</span>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-red-950/30">
            {/* Paid (green) portion */}
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: "#10B981",
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="text-[#10B981]">Pago</span>
            <span className="text-[#FF1744]">Restante</span>
          </div>
        </div>

        {/* 3-stat row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-muted/30 p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground mb-0.5">Valor Total</p>
            <p className="text-xs font-bold text-foreground">{formatCurrency(totalDebt)}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground mb-0.5">Por Parcela</p>
            <p className="text-xs font-bold text-foreground">{formatCurrency(installmentValue)}</p>
          </div>
          <div className="rounded-lg bg-red-950/20 p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground mb-0.5">Restante</p>
            <p className="text-xs font-bold text-[#FF1744]">{formatCurrency(amountRemaining)}</p>
          </div>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" />
            <span>Quitação prevista: <span className="text-foreground font-medium">{payoffDate}</span></span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <TrendingDown className="h-3.5 w-3.5 text-[#10B981]" />
            <span className="font-semibold text-[#10B981]">{formatCurrency(amountPaid)} pagos</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
