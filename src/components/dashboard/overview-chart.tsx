"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { formatCurrency, formatCompactNumber } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { MonthlyData } from "@/lib/types"

interface OverviewChartProps {
  data: MonthlyData[]
  isLoading?: boolean
}

type ChartPeriod = "3m" | "6m" | "12m"

const periodOptions: { value: ChartPeriod; label: string }[] = [
  { value: "3m", label: "3M" },
  { value: "6m", label: "6M" },
  { value: "12m", label: "12M" },
]

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-white/5", className)} />
  )
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-[#111111] p-3 shadow-2xl min-w-[180px]">
      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
        {label}
      </p>
      <div className="space-y-1.5">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-muted-foreground">{entry.name}</span>
            </div>
            <span className="text-xs font-semibold text-foreground tabular-nums">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface CustomLegendProps {
  payload?: Array<{ value: string; color: string }>
}

function CustomLegend({ payload }: CustomLegendProps) {
  if (!payload) return null
  return (
    <div className="flex items-center gap-4 justify-end pb-2">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function OverviewChart({ data, isLoading = false }: OverviewChartProps) {
  const [period, setPeriod] = React.useState<ChartPeriod>("6m")

  const sliceMap: Record<ChartPeriod, number> = {
    "3m": 3,
    "6m": 6,
    "12m": 12,
  }

  const chartData = data.slice(-sliceMap[period])

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
      className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Receita vs Gastos
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Comparativo dos últimos {sliceMap[period]} meses
          </p>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-1 rounded-full bg-muted/50 p-1">
          {periodOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 cursor-pointer",
                period === opt.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          barGap={4}
          barCategoryGap="30%"
        >
          <CartesianGrid
            vertical={false}
            stroke="#333333"
            strokeDasharray="4 4"
            strokeOpacity={0.6}
          />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6B7280", fontSize: 11, fontFamily: "Inter" }}
            dy={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6B7280", fontSize: 11, fontFamily: "Inter" }}
            tickFormatter={(v) => formatCompactNumber(v)}
            width={48}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.04)", radius: 6 }}
          />
          <Legend content={<CustomLegend />} />
          <Bar
            dataKey="receita"
            name="Receita"
            fill="#00C853"
            radius={[4, 4, 0, 0]}
            isAnimationActive={true}
            animationDuration={600}
            animationEasing="ease-out"
          />
          <Bar
            dataKey="gastos_empresa"
            name="Gastos Empresa"
            fill="#FF5252"
            radius={[4, 4, 0, 0]}
            isAnimationActive={true}
            animationDuration={700}
            animationEasing="ease-out"
          />
          <Bar
            dataKey="gastos_pessoais"
            name="Gastos Pessoais"
            fill="#FF8A80"
            radius={[4, 4, 0, 0]}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
