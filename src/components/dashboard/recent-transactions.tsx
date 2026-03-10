"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowRight, Building2, User } from "lucide-react"
import { formatCurrency, formatRelativeTime } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { CompanyExpense, PersonalExpense } from "@/lib/types"
import {
  COMPANY_CATEGORIES,
  PERSONAL_CATEGORIES,
  COMPANY_CATEGORY_COLORS,
  PERSONAL_CATEGORY_COLORS,
} from "@/lib/data"

interface NormalizedTransaction {
  id: string
  title: string
  category: string
  categoryLabel: string
  categoryColor: string
  date: string
  value: number
  type: "empresa" | "pessoal"
}

interface RecentTransactionsProps {
  companyExpenses: CompanyExpense[]
  personalExpenses: PersonalExpense[]
  isLoading?: boolean
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-white/5", className)} />
  )
}

function TransactionRow({
  tx,
  index,
}: {
  tx: NormalizedTransaction
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.05 * index, ease: "easeOut" }}
      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 hover:bg-white/[0.04] cursor-default"
    >
      {/* Category icon circle */}
      <div
        className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0"
        style={{
          backgroundColor: `${tx.categoryColor}20`,
        }}
      >
        <span
          className="text-[10px] font-bold uppercase"
          style={{ color: tx.categoryColor }}
        >
          {tx.categoryLabel.slice(0, 2)}
        </span>
      </div>

      {/* Title + category */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate leading-tight">
          {tx.title}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {tx.categoryLabel}
        </p>
      </div>

      {/* Date */}
      <span className="text-xs text-muted-foreground flex-shrink-0 hidden sm:block">
        {formatRelativeTime(tx.date)}
      </span>

      {/* Type badge */}
      <div className="flex-shrink-0">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
            tx.type === "empresa"
              ? "bg-[#6366F1]/10 text-[#6366F1]"
              : "bg-[#F59E0B]/10 text-[#F59E0B]"
          )}
        >
          {tx.type === "empresa" ? (
            <Building2 className="w-2.5 h-2.5" />
          ) : (
            <User className="w-2.5 h-2.5" />
          )}
          {tx.type === "empresa" ? "Empresa" : "Pessoal"}
        </span>
      </div>

      {/* Value */}
      <span className="text-sm font-semibold tabular-nums text-[#FF5252] flex-shrink-0 min-w-[80px] text-right">
        -{formatCurrency(tx.value)}
      </span>
    </motion.div>
  )
}

export function RecentTransactions({
  companyExpenses,
  personalExpenses,
  isLoading = false,
}: RecentTransactionsProps) {
  const transactions: NormalizedTransaction[] = React.useMemo(() => {
    const company: NormalizedTransaction[] = companyExpenses.map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      categoryLabel: COMPANY_CATEGORIES[e.category] ?? e.category,
      categoryColor: COMPANY_CATEGORY_COLORS[e.category] ?? "#9CA3AF",
      date: e.date,
      value: e.value,
      type: "empresa",
    }))

    const personal: NormalizedTransaction[] = personalExpenses.map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      categoryLabel: PERSONAL_CATEGORIES[e.category] ?? e.category,
      categoryColor: PERSONAL_CATEGORY_COLORS[e.category] ?? "#9CA3AF",
      date: e.date,
      value: e.value,
      type: "pessoal",
    }))

    return [...company, ...personal]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
  }, [companyExpenses, personalExpenses])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
      className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Transações Recentes
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Últimos 10 lançamentos
          </p>
        </div>
        <button className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors duration-150 cursor-pointer group/link">
          Ver todos
          <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform duration-150" />
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-3 w-16 hidden sm:block" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-3.5 w-20" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma transação encontrada.
          </p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {transactions.map((tx, i) => (
            <TransactionRow key={tx.id} tx={tx} index={i} />
          ))}
        </div>
      )}
    </motion.div>
  )
}
