"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Bell, Sun, Moon, CalendarRange } from "lucide-react"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useUIStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { Period } from "@/lib/types"

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/gastos-empresa": "Gastos da Empresa",
  "/gastos-pessoais": "Gastos Pessoais",
  "/analise-geral": "Análise Geral",
  "/tasks": "Task Manager",
  "/configuracoes": "Configurações",
}

function getPageTitle(pathname: string): string {
  // Exact match first
  if (routeTitles[pathname]) return routeTitles[pathname]
  // Prefix match for nested routes
  const matched = Object.keys(routeTitles).find((route) =>
    pathname.startsWith(route + "/")
  )
  return matched ? routeTitles[matched] : "Track Finance"
}

interface PeriodPill {
  value: Period
  label: string
}

const periodPills: PeriodPill[] = [
  { value: "hoje", label: "Hoje" },
  { value: "7dias", label: "7 dias" },
  { value: "mes_atual", label: "Este mês" },
  { value: "mes_passado", label: "Mês passado" },
  { value: "total", label: "Todo período" },
]

export function Header() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const { activePeriod, setActivePeriod, dateRange, setDateRange } = useUIStore()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const pageTitle = getPageTitle(pathname)

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-border shrink-0 gap-4">
      {/* Left: Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-base font-semibold text-foreground truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Period Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {periodPills.map((pill) => (
            <button
              key={pill.value}
              onClick={() => setActivePeriod(pill.value)}
              className={cn(
                "flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap",
                activePeriod === pill.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {pill.label}
            </button>
          ))}

          {/* Custom date range icon pill */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                onClick={() => setActivePeriod("personalizado")}
                className={cn(
                  "flex-shrink-0 rounded-full p-1.5 transition-all duration-150 cursor-pointer",
                  activePeriod === "personalizado"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                title="Período personalizado"
              >
                <CalendarRange className="w-3.5 h-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) => {
                  if (range) {
                    setDateRange({ from: range.from, to: range.to })
                  } else {
                    setDateRange({ from: undefined, to: undefined })
                  }
                }}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-border mx-1" />

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="w-8 h-8 cursor-pointer text-muted-foreground hover:text-foreground"
          title={mounted ? (resolvedTheme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro") : "Alternar tema"}
        >
          {mounted ? (
            resolvedTheme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )
          ) : (
            <Sun className="w-4 h-4 opacity-0" />
          )}
        </Button>

        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 relative cursor-pointer text-muted-foreground hover:text-foreground"
          title="Notificações"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center leading-none">
            3
          </span>
        </Button>
      </div>
    </header>
  )
}
