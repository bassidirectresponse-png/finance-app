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
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { useCompanyStore } from "@/lib/store"
import { COMPANY_CATEGORIES, COMPANY_CATEGORY_COLORS, MONTHLY_DATA } from "@/lib/data"
import { formatCurrency } from "@/lib/formatters"
import type { CompanyCategory } from "@/lib/types"

// ─── Pie chart tooltip ────────────────────────────────────────────────

interface PieTooltipPayload {
  name: string
  value: number
  payload: {
    category: CompanyCategory
    value: number
    percentage: number
    color: string
  }
}

function PieTooltipContent({
  active,
  payload,
}: {
  active?: boolean
  payload?: PieTooltipPayload[]
}) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="font-medium text-foreground">{item.name}</p>
      <p className="text-muted-foreground">{formatCurrency(item.value)}</p>
      <p className="text-muted-foreground">{item.payload.percentage.toFixed(1)}%</p>
    </div>
  )
}

// ─── Bar chart tooltip ────────────────────────────────────────────────

interface BarTooltipPayload {
  name: string
  value: number
}

function BarTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: BarTooltipPayload[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="font-medium text-foreground mb-1">{label}</p>
      <p className="text-red-400">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────

export function CompanyCharts() {
  const expenses = useCompanyStore((s) => s.expenses)

  // ─── Pie data: expenses by category ──────────────────────────────

  const pieData = React.useMemo(() => {
    const totals: Partial<Record<CompanyCategory, number>> = {}
    for (const e of expenses) {
      totals[e.category] = (totals[e.category] ?? 0) + e.value
    }
    const grandTotal = Object.values(totals).reduce((acc, v) => acc + (v ?? 0), 0)

    return (Object.entries(totals) as [CompanyCategory, number][])
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([category, value]) => ({
        category,
        name: COMPANY_CATEGORIES[category],
        value,
        percentage: grandTotal > 0 ? (value / grandTotal) * 100 : 0,
        color: COMPANY_CATEGORY_COLORS[category],
      }))
  }, [expenses])

  // ─── Bar data: last 6 months ──────────────────────────────────────

  const barData = React.useMemo(() => {
    return MONTHLY_DATA.slice(-6).map((d) => ({
      month: d.month,
      gastos: d.gastos_empresa,
    }))
  }, [])

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Pie chart — gastos por categoria */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">
            Gastos por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
              Nenhum dado disponível
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Donut chart */}
              <div className="w-full sm:w-[200px] h-[200px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={entry.category}
                          fill={entry.color}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-2 flex-1 min-w-0 w-full">
                {pieData.map((item) => (
                  <div key={item.category} className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-muted-foreground truncate flex-1">
                      {item.name}
                    </span>
                    <span className="text-xs font-medium text-foreground flex-shrink-0">
                      {formatCurrency(item.value)}
                    </span>
                    <span className="text-xs text-muted-foreground flex-shrink-0 w-10 text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bar chart — evolução mensal */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">
            Evolução Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                barCategoryGap="30%"
              >
                <defs>
                  <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
                  }
                  width={44}
                />
                <Tooltip content={<BarTooltipContent />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }} />
                <Bar
                  dataKey="gastos"
                  name="Gastos Empresa"
                  fill="url(#redGradient)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
