"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Building2,
  User,
  BarChart3,
  CheckSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useUIStore } from "@/lib/store"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Gastos da Empresa", href: "/gastos-empresa", icon: Building2 },
  { label: "Gastos Pessoais", href: "/gastos-pessoais", icon: User },
  { label: "Análise Geral", href: "/analise-geral", icon: BarChart3 },
  { label: "Task Manager", href: "/tasks", icon: CheckSquare },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
]

interface TooltipProps {
  label: string
  children: React.ReactNode
  show: boolean
}

function NavTooltip({ label, children, show }: TooltipProps) {
  const [visible, setVisible] = React.useState(false)

  if (!show) return <>{children}</>

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-full ml-3 z-50 whitespace-nowrap rounded-md bg-card border border-border px-2.5 py-1.5 text-xs font-medium text-foreground shadow-lg pointer-events-none"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <motion.div
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col h-screen shrink-0 overflow-hidden border-r border-border"
      style={{ backgroundColor: "var(--sidebar-bg)" }}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-16 px-4 shrink-0 border-b border-border",
          sidebarCollapsed ? "justify-center" : "gap-3"
        )}
      >
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold leading-none">
              T
            </span>
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-primary border-2 border-sidebar-bg" />
        </div>

        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <span className="whitespace-nowrap text-sm font-semibold text-foreground tracking-tight">
                Track Finance
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <NavTooltip key={item.href} label={item.label} show={sidebarCollapsed}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg cursor-pointer transition-all duration-150 group relative",
                  sidebarCollapsed
                    ? "justify-center w-full h-10 px-0"
                    : "gap-3 px-3 py-2.5",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {/* Active left border indicator */}
                {isActive && !sidebarCollapsed && (
                  <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-primary" />
                )}

                <Icon
                  className={cn(
                    "flex-shrink-0 transition-colors duration-150",
                    sidebarCollapsed ? "w-5 h-5" : "w-4 h-4",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />

                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className={cn(
                        "overflow-hidden whitespace-nowrap text-sm font-medium",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </NavTooltip>
          )
        })}
      </nav>

      {/* User & Collapse */}
      <div className="shrink-0 border-t border-border p-2 space-y-1">
        {/* User Avatar Row */}
        <NavTooltip label="Guilherme Augusto" show={sidebarCollapsed}>
          <div
            className={cn(
              "flex items-center rounded-lg cursor-pointer transition-all duration-150 hover:bg-muted/50",
              sidebarCollapsed
                ? "justify-center w-full h-10 px-0"
                : "gap-3 px-3 py-2.5"
            )}
          >
            <Avatar className="w-7 h-7 flex-shrink-0">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                GA
              </AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="whitespace-nowrap text-sm font-medium text-foreground leading-none">
                    Guilherme Augusto
                  </p>
                  <p className="whitespace-nowrap text-xs text-muted-foreground mt-0.5">
                    Administrador
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </NavTooltip>

        {/* Collapse Toggle */}
        <NavTooltip label={sidebarCollapsed ? "Expandir" : "Recolher"} show={sidebarCollapsed}>
          <button
            onClick={toggleSidebar}
            className={cn(
              "flex items-center rounded-lg cursor-pointer transition-all duration-150 text-muted-foreground hover:text-foreground hover:bg-muted/50 w-full",
              sidebarCollapsed
                ? "justify-center h-10 px-0"
                : "gap-3 px-3 py-2.5"
            )}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                <AnimatePresence>
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden whitespace-nowrap text-sm font-medium"
                  >
                    Recolher
                  </motion.span>
                </AnimatePresence>
              </>
            )}
          </button>
        </NavTooltip>
      </div>
    </motion.div>
  )
}
