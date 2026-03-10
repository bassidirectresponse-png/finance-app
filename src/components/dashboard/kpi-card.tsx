"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"
import { formatCurrency, formatPercent } from "@/lib/formatters"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: number
  change: number
  changeLabel?: string
  sparklineData: number[]
  icon: React.ReactNode
  colorScheme: "green" | "red" | "blue" | "purple"
  isLoading?: boolean
  prefix?: string
  delay?: number
}

const colorMap = {
  green: {
    fill: "#00C853",
    stroke: "#00E676",
    iconBg: "bg-[#00C853]/15",
    iconText: "text-[#00C853]",
    gradientId: "green-gradient",
  },
  red: {
    fill: "#FF5252",
    stroke: "#FF1744",
    iconBg: "bg-[#FF1744]/15",
    iconText: "text-[#FF5252]",
    gradientId: "red-gradient",
  },
  blue: {
    fill: "#2563EB",
    stroke: "#3B82F6",
    iconBg: "bg-[#2563EB]/15",
    iconText: "text-[#3B82F6]",
    gradientId: "blue-gradient",
  },
  purple: {
    fill: "#8B5CF6",
    stroke: "#A78BFA",
    iconBg: "bg-[#8B5CF6]/15",
    iconText: "text-[#A78BFA]",
    gradientId: "purple-gradient",
  },
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-white/5",
        className
      )}
    />
  )
}

export function KPICard({
  title,
  value,
  change,
  changeLabel = "vs. mês anterior",
  sparklineData,
  icon,
  colorScheme,
  isLoading = false,
  delay = 0,
}: KPICardProps) {
  const colors = colorMap[colorScheme]
  const isPositive = change >= 0
  const gradientId = `${colors.gradientId}-${Math.random().toString(36).slice(2, 7)}`

  const sparkData = sparklineData.map((v, i) => ({ v, i }))

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-[80px] w-full" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.01 }}
      className="group rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-5 flex flex-col gap-4 cursor-default transition-shadow duration-200 hover:shadow-lg hover:shadow-black/20 hover:border-border/80"
    >
      {/* Top row: icon + title */}
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full",
            colors.iconBg,
            colors.iconText
          )}
        >
          {icon}
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
      </div>

      {/* Value */}
      <div className="space-y-1">
        <p className="text-3xl font-bold tabular-nums text-foreground leading-none">
          {formatCurrency(value)}
        </p>

        {/* Change badge */}
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
              isPositive
                ? "bg-[#00C853]/10 text-[#00C853]"
                : "bg-[#FF1744]/10 text-[#FF5252]"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {formatPercent(change)}
          </span>
          <span className="text-xs text-muted-foreground">{changeLabel}</span>
        </div>
      </div>

      {/* Sparkline */}
      <div className="h-[80px] -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={sparkData}
            margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={colors.fill}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={colors.fill}
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={colors.stroke}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={false}
              isAnimationActive={true}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
