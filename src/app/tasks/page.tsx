"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Plus,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ClipboardList,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { KanbanBoard } from "@/components/tasks/kanban-board"
import { TaskList } from "@/components/tasks/task-list"
import { TaskForm } from "@/components/tasks/task-form"
import { useTasksStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { Task, TaskStatus } from "@/lib/types"

// ─── View Toggle ──────────────────────────────────────────────────────

type ViewMode = "kanban" | "lista"

// ─── Stat Card ────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
  index,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="rounded-2xl border border-border bg-card p-4 flex items-start gap-4"
    >
      <div
        className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
        style={{ backgroundColor: color + "22" }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────

export default function TasksPage() {
  const tasks = useTasksStore((s) => s.tasks)

  const [viewMode, setViewMode] = React.useState<ViewMode>("kanban")
  const [formOpen, setFormOpen] = React.useState(false)
  const [editTask, setEditTask] = React.useState<Task | null>(null)
  const [defaultStatus, setDefaultStatus] = React.useState<TaskStatus | undefined>()

  // ── Stats ──────────────────────────────────────────────────────────

  const totalTasks = tasks.length
  const inProgress = tasks.filter((t) => t.status === "em_progresso").length
  const completed = tasks.filter((t) => t.status === "concluido").length

  const today = new Date().toISOString().slice(0, 10)
  const overdue = tasks.filter(
    (t) => t.dueDate && t.dueDate < today && t.status !== "concluido"
  ).length

  // ── Handlers ───────────────────────────────────────────────────────

  function handleAddClick(status?: TaskStatus) {
    setEditTask(null)
    setDefaultStatus(status)
    setFormOpen(true)
  }

  function handleEditTask(task: Task) {
    setEditTask(task)
    setDefaultStatus(undefined)
    setFormOpen(true)
  }

  function handleFormClose() {
    setFormOpen(false)
    setEditTask(null)
    setDefaultStatus(undefined)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task Manager</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie suas tarefas com quadro Kanban ou lista completa
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
                viewMode === "kanban"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode("lista")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
                viewMode === "lista"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="w-3.5 h-3.5" />
              Lista
            </button>
          </div>

          {/* New Task */}
          <Button
            onClick={() => handleAddClick()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          index={0}
          label="Total de Tarefas"
          value={totalTasks}
          icon={<ClipboardList className="h-5 w-5" />}
          color="#6366F1"
        />
        <StatCard
          index={1}
          label="Em Progresso"
          value={inProgress}
          icon={<Clock className="h-5 w-5" />}
          color="#F59E0B"
        />
        <StatCard
          index={2}
          label="Concluídas"
          value={completed}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="#00C853"
        />
        <StatCard
          index={3}
          label="Atrasadas"
          value={overdue}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="#FF1744"
        />
      </div>

      {/* Content */}
      {viewMode === "kanban" ? (
        <KanbanBoard
          onAddClick={handleAddClick}
          onEditTask={handleEditTask}
        />
      ) : (
        <TaskList onAddClick={() => handleAddClick()} />
      )}

      {/* Form Sheet */}
      <TaskForm
        open={formOpen}
        onClose={handleFormClose}
        editTask={editTask}
        defaultStatus={defaultStatus}
      />
    </div>
  )
}
