"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Sector,
} from "recharts"
import { formatCurrency, formatPercent } from "@/lib/formatters"
import { cn } from "@/lib/utils"

interface PieDataItem {
  name: string
  value: number
  color: string
}

interface ExpensePieProps {
  data: PieDataItem[]
  isLoading?: boolean
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-white/5", className)} />
  )
}

interface ActiveShapeProps {
  cx: number
  cy: number
  innerRadius: number
  outerRadius: number
  startAngle: number
  endAngle: number
  fill: string
  payload: PieDataItem
  percent: number
  value: number
}

function renderActiveShape(props: ActiveShapeProps) {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
  } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 3}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={1}
      />
    </g>
  )
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: PieDataItem; value: number; name: string }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0]
  return (
    <div className="rounded-xl border border-border bg-[#111111] p-3 shadow-2xl min-w-[160px]">
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: item.payload.color }}
        />
        <span className="text-xs font-semibold text-foreground">
          {item.name}
        </span>
      </div>
      <p className="text-sm font-bold text-foreground tabular-nums">
        {formatCurrency(item.value)}
      </p>
    </div>
  )
}

export function ExpensePie({ data, isLoading = false }: ExpensePieProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(
    undefined
  )

  const total = data.reduce((sum, item) => sum + item.value, 0)

  const dataWithPercent = data
    .map((item) => ({
      ...item,
      percentage: total > 0 ? (item.value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value)

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 space-y-4">
        <div className="space-y-1">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-[200px] w-[200px] rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
      className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6"
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">
          Distribuição por Categoria
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Gastos da empresa por categoria
        </p>
      </div>

      {/* Chart + Legend layout */}
      <div className="flex flex-col items-center gap-5">
        {/* Donut */}
        <div className="relative w-full" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithPercent}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                dataKey="value"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {...{ activeIndex } as any}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                activeShape={(props: any) => renderActiveShape(props)}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
                isAnimationActive={true}
                animationBegin={100}
                animationDuration={700}
                animationEasing="ease-out"
                stroke="none"
              >
                {dataWithPercent.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    opacity={
                      activeIndex === undefined || activeIndex === index
                        ? 1
                        : 0.45
                    }
                    style={{ cursor: "pointer", outline: "none" }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Total
            </span>
            <span className="text-base font-bold text-foreground tabular-nums mt-0.5 leading-tight text-center px-2">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Legend list */}
        <div className="w-full space-y-2">
          {dataWithPercent.map((item, index) => (
            <div
              key={item.name}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors duration-150 cursor-default",
                activeIndex === index
                  ? "bg-white/5"
                  : "hover:bg-white/[0.03]"
              )}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground truncate">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-medium text-muted-foreground">
                  {formatPercent(item.percentage).replace("+", "")}
                </span>
                <span className="text-xs font-semibold text-foreground tabular-nums">
                  {formatCurrency(item.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
