"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { TaskCard } from "@/components/tasks/task-card"
import { useTasksStore } from "@/lib/store"
import { TASK_STATUS_LABELS } from "@/lib/types"
import type { Task, TaskStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

// ─── Column Config ─────────────────────────────────────────────────────

interface ColumnConfig {
  id: TaskStatus
  label: string
  borderColor: string
  bgColor: string
}

const COLUMNS: ColumnConfig[] = [
  {
    id: "backlog",
    label: TASK_STATUS_LABELS.backlog,
    borderColor: "#6B7280",
    bgColor: "rgba(107,114,128,0.06)",
  },
  {
    id: "a_fazer",
    label: TASK_STATUS_LABELS.a_fazer,
    borderColor: "#6366F1",
    bgColor: "rgba(99,102,241,0.06)",
  },
  {
    id: "em_progresso",
    label: TASK_STATUS_LABELS.em_progresso,
    borderColor: "#F59E0B",
    bgColor: "rgba(245,158,11,0.06)",
  },
  {
    id: "revisao",
    label: TASK_STATUS_LABELS.revisao,
    borderColor: "#8B5CF6",
    bgColor: "rgba(139,92,246,0.06)",
  },
  {
    id: "concluido",
    label: TASK_STATUS_LABELS.concluido,
    borderColor: "#00C853",
    bgColor: "rgba(0,200,83,0.06)",
  },
]

// ─── Sortable Card Wrapper ─────────────────────────────────────────────

function SortableTaskCard({
  task,
  onEdit,
}: {
  task: Task
  onEdit: (task: Task) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => !isDragging && onEdit(task)}
    >
      <TaskCard task={task} isDragging={false} />
    </div>
  )
}

// ─── Column Component ──────────────────────────────────────────────────

function KanbanColumn({
  column,
  tasks,
  onAddClick,
  onEditTask,
}: {
  column: ColumnConfig
  tasks: Task[]
  onAddClick: (status: TaskStatus) => void
  onEditTask: (task: Task) => void
}) {
  return (
    <div
      className="flex flex-col rounded-xl border border-border min-w-[240px] w-[260px] flex-shrink-0 max-h-[calc(100vh-220px)]"
      style={{
        background: column.bgColor,
        borderTopWidth: "3px",
        borderTopColor: column.borderColor,
      }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            {column.label}
          </h3>
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white min-w-[20px] text-center"
            style={{ background: column.borderColor }}
          >
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Task Cards */}
      <div className="flex-1 overflow-y-auto px-2.5 pb-2 space-y-2 min-h-[60px]">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
            />
          ))}
        </SortableContext>
      </div>

      {/* Quick Add Button */}
      <div className="px-2.5 py-2 shrink-0">
        <button
          onClick={() => onAddClick(column.id)}
          className={cn(
            "w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg",
            "text-xs text-muted-foreground hover:text-foreground",
            "border border-dashed border-border hover:border-primary/40",
            "hover:bg-muted/40 transition-all duration-150 cursor-pointer"
          )}
        >
          <Plus className="w-3 h-3" />
          Adicionar
        </button>
      </div>
    </div>
  )
}

// ─── Main Board Component ──────────────────────────────────────────────

interface KanbanBoardProps {
  onAddClick: (status?: TaskStatus) => void
  onEditTask: (task: Task) => void
}

export function KanbanBoard({ onAddClick, onEditTask }: KanbanBoardProps) {
  const tasks = useTasksStore((s) => s.tasks)
  const moveTask = useTasksStore((s) => s.moveTask)

  const [activeTask, setActiveTask] = React.useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Group tasks by status
  const tasksByColumn = React.useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      backlog: [],
      a_fazer: [],
      em_progresso: [],
      revisao: [],
      concluido: [],
    }
    for (const task of tasks) {
      map[task.status].push(task)
    }
    return map
  }, [tasks])

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeTaskId = String(active.id)
    const overId = String(over.id)

    // Check if dropped over a column id
    const targetColumn = COLUMNS.find((col) => col.id === overId)
    if (targetColumn) {
      const task = tasks.find((t) => t.id === activeTaskId)
      if (task && task.status !== targetColumn.id) {
        moveTask(activeTaskId, targetColumn.id)
        toast.success(`Tarefa movida para "${targetColumn.label}"`)
      }
      return
    }

    // Dropped over another task — find its column
    const overTask = tasks.find((t) => t.id === overId)
    if (overTask) {
      const task = tasks.find((t) => t.id === activeTaskId)
      if (task && task.status !== overTask.status) {
        moveTask(activeTaskId, overTask.status)
        toast.success(`Tarefa movida para "${TASK_STATUS_LABELS[overTask.status]}"`)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasksByColumn[column.id]}
            onAddClick={onAddClick}
            onEditTask={onEditTask}
          />
        ))}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging={true} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
