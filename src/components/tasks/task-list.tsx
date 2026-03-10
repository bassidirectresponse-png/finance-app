"use client"

import * as React from "react"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/shared/confirm-modal"
import { TaskForm } from "@/components/tasks/task-form"

import { useTasksStore } from "@/lib/store"
import { formatDateShort } from "@/lib/formatters"
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from "@/lib/types"
import type { Task, TaskStatus, Priority } from "@/lib/types"
import { cn } from "@/lib/utils"

// ─── Props ─────────────────────────────────────────────────────────────

interface TaskListProps {
  onAddClick: () => void
}

// ─── Helpers ───────────────────────────────────────────────────────────

const PRIORITY_ORDER: Priority[] = ["urgente", "alta", "media", "baixa"]

const PRIORITY_BG: Record<Priority, string> = {
  urgente: "bg-red-500/15 text-red-500",
  alta: "bg-orange-500/15 text-orange-500",
  media: "bg-yellow-500/15 text-yellow-500",
  baixa: "bg-gray-500/15 text-gray-500",
}

// ─── Component ─────────────────────────────────────────────────────────

export function TaskList({ onAddClick }: TaskListProps) {
  const tasks = useTasksStore((s) => s.tasks)
  const deleteTask = useTasksStore((s) => s.deleteTask)

  const [priorityFilter, setPriorityFilter] = React.useState<Priority | "all">("all")
  const [statusFilter, setStatusFilter] = React.useState<TaskStatus | "all">("all")
  const [dateFilter, setDateFilter] = React.useState<"all" | "overdue" | "today" | "week">("all")

  const [editTask, setEditTask] = React.useState<Task | null>(null)
  const [formOpen, setFormOpen] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const today = new Date().toISOString().slice(0, 10)
  const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  const filtered = React.useMemo(() => {
    return tasks.filter((task) => {
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false
      if (statusFilter !== "all" && task.status !== statusFilter) return false
      if (dateFilter === "overdue") {
        if (!task.dueDate || task.dueDate >= today || task.status === "concluido") return false
      } else if (dateFilter === "today") {
        if (task.dueDate !== today) return false
      } else if (dateFilter === "week") {
        if (!task.dueDate || task.dueDate > weekFromNow) return false
      }
      return true
    })
  }, [tasks, priorityFilter, statusFilter, dateFilter, today, weekFromNow])

  function handleDelete(id: string) {
    deleteTask(id)
    toast.success("Tarefa excluída!")
    setDeleteId(null)
  }

  function handleEdit(task: Task) {
    setEditTask(task)
    setFormOpen(true)
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Priority filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as Priority | "all")}
          className="bg-background border border-border text-foreground text-sm rounded-lg px-3 py-1.5 cursor-pointer"
        >
          <option value="all">Todas as prioridades</option>
          {PRIORITY_ORDER.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "all")}
          className="bg-background border border-border text-foreground text-sm rounded-lg px-3 py-1.5 cursor-pointer"
        >
          <option value="all">Todos os status</option>
          {(Object.entries(TASK_STATUS_LABELS) as [TaskStatus, string][]).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>

        {/* Date filter */}
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
          className="bg-background border border-border text-foreground text-sm rounded-lg px-3 py-1.5 cursor-pointer"
        >
          <option value="all">Todos os prazos</option>
          <option value="overdue">Atrasadas</option>
          <option value="today">Vencem hoje</option>
          <option value="week">Próximos 7 dias</option>
        </select>

        <div className="ml-auto">
          <Button
            size="sm"
            onClick={onAddClick}
            className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            + Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[40px_1fr_130px_110px_120px_80px] gap-2 px-4 py-3 border-b border-border bg-muted/30">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            #
          </div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Título
          </div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Status
          </div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Prioridade
          </div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Vencimento
          </div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">
            Ações
          </div>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
            Nenhuma tarefa encontrada com os filtros selecionados.
          </div>
        ) : (
          filtered.map((task, idx) => {
            const isOverdue =
              task.dueDate &&
              task.dueDate < today &&
              task.status !== "concluido"

            return (
              <div
                key={task.id}
                className={cn(
                  "grid grid-cols-[40px_1fr_130px_110px_120px_80px] gap-2 px-4 py-3 items-center",
                  "border-b border-border last:border-0 hover:bg-muted/20 transition-colors",
                  isOverdue && "border-l-2 border-l-red-500"
                )}
              >
                {/* Index */}
                <span className="text-xs text-muted-foreground">{idx + 1}</span>

                {/* Title + Tags */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {task.title}
                  </p>
                  {task.tags.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {task.tags.slice(0, 3).map((tag) => (
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
                </div>

                {/* Status */}
                <div>
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full"
                    style={{
                      background: TASK_STATUS_COLORS[task.status] + "25",
                      color: TASK_STATUS_COLORS[task.status],
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: TASK_STATUS_COLORS[task.status] }}
                    />
                    {TASK_STATUS_LABELS[task.status]}
                  </span>
                </div>

                {/* Priority */}
                <div>
                  <span
                    className={cn(
                      "text-xs font-semibold px-2 py-1 rounded-full",
                      PRIORITY_BG[task.priority]
                    )}
                  >
                    {PRIORITY_LABELS[task.priority]}
                  </span>
                </div>

                {/* Due Date */}
                <div>
                  {task.dueDate ? (
                    <span
                      className={cn(
                        "text-xs",
                        isOverdue
                          ? "text-red-500 font-semibold"
                          : "text-muted-foreground"
                      )}
                    >
                      {formatDateShort(task.dueDate)}
                      {isOverdue && (
                        <span className="ml-1 text-[9px] bg-red-500/15 text-red-500 px-1 py-0.5 rounded font-bold">
                          Atr.
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">—</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={() => handleEdit(task)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-muted-foreground hover:text-destructive cursor-pointer"
                    onClick={() => setDeleteId(task.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Edit Form */}
      <TaskForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditTask(null)
        }}
        editTask={editTask}
      />

      {/* Delete Confirm */}
      <ConfirmModal
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Excluir tarefa"
        description="Tem certeza que deseja excluir esta tarefa? Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        variant="destructive"
      />
    </>
  )
}
