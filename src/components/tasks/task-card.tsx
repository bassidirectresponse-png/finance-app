"use client"

import * as React from "react"
import { CalendarDays } from "lucide-react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { formatDateShort } from "@/lib/formatters"
import { PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/types"
import type { Task } from "@/lib/types"

// ─── Priority Badge ────────────────────────────────────────────────────

const PRIORITY_BG: Record<string, string> = {
  urgente: "#FF1744",
  alta: "#F97316",
  media: "#F59E0B",
  baixa: "#6B7280",
}

// ─── Props ─────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task
  isDragging?: boolean
}

// ─── Component ─────────────────────────────────────────────────────────

export function TaskCard({ task, isDragging = false }: TaskCardProps) {
  const today = new Date().toISOString().slice(0, 10)
  const isOverdue = task.dueDate ? task.dueDate < today && task.status !== "concluido" : false

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length
  const totalSubtasks = task.subtasks.length
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  // Assignee initials
  const initials = task.assignee
    ? task.assignee
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join("")
    : null

  return (
    <motion.div
      layout
      className={cn(
        "relative rounded-xl bg-card border border-border p-3.5 cursor-grab select-none",
        "hover:border-primary/40 hover:shadow-md transition-all duration-150",
        isDragging && "shadow-2xl scale-105 opacity-90 cursor-grabbing border-primary/50"
      )}
    >
      {/* Priority Badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white shrink-0"
          style={{ background: PRIORITY_BG[task.priority] ?? "#6B7280" }}
        >
          {PRIORITY_LABELS[task.priority]}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-foreground leading-snug mb-1">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white leading-none"
              style={{ background: tag.color }}
            >
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {/* Subtasks Progress */}
      {totalSubtasks > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">
              Subtarefas
            </span>
            <span className="text-[10px] font-semibold text-foreground">
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer: Due Date + Assignee */}
      <div className="flex items-center justify-between mt-1 gap-2">
        {/* Due Date */}
        {task.dueDate ? (
          <div
            className={cn(
              "flex items-center gap-1 text-[11px] font-medium",
              isOverdue ? "text-red-500" : "text-muted-foreground"
            )}
          >
            <CalendarDays className="w-3 h-3 shrink-0" />
            <span>{formatDateShort(task.dueDate)}</span>
            {isOverdue && (
              <span className="text-[9px] font-bold bg-red-500/15 text-red-500 px-1 py-0.5 rounded">
                Atrasado
              </span>
            )}
          </div>
        ) : (
          <span />
        )}

        {/* Assignee Avatar */}
        {initials && (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
            style={{
              background:
                PRIORITY_COLORS[task.priority] ?? "#6366F1",
            }}
            title={task.assignee}
          >
            {initials}
          </div>
        )}
      </div>
    </motion.div>
  )
}
