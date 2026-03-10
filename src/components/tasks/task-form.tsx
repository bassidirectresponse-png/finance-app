"use client"

import * as React from "react"
import { Plus, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useTasksStore } from "@/lib/store"
import {
  TASK_STATUS_LABELS,
  TASK_RECURRENCE_LABELS,
  PRIORITY_LABELS,
} from "@/lib/types"
import type { Task, TaskStatus, Priority, TaskRecurrence, Tag, Subtask } from "@/lib/types"

// ─── Props ─────────────────────────────────────────────────────────────

interface TaskFormProps {
  open: boolean
  onClose: () => void
  editTask?: Task | null
  defaultStatus?: TaskStatus
}

// ─── Tag Color Swatches ────────────────────────────────────────────────

const TAG_COLORS = [
  "#FF1744", "#F97316", "#F59E0B", "#10B981",
  "#06B6D4", "#6366F1", "#8B5CF6", "#EC4899",
  "#6B7280", "#14B8A6",
]

// ─── ID Generator ──────────────────────────────────────────────────────

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ─── Form State ────────────────────────────────────────────────────────

interface FormState {
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  dueDate: string
  recurrence: TaskRecurrence
  tags: Tag[]
  subtasks: Subtask[]
}

function getInitial(editTask?: Task | null, defaultStatus?: TaskStatus): FormState {
  if (editTask) {
    return {
      title: editTask.title,
      description: editTask.description ?? "",
      status: editTask.status,
      priority: editTask.priority,
      dueDate: editTask.dueDate ?? "",
      recurrence: editTask.recurrence,
      tags: editTask.tags,
      subtasks: editTask.subtasks,
    }
  }
  return {
    title: "",
    description: "",
    status: defaultStatus ?? "a_fazer",
    priority: "media",
    dueDate: "",
    recurrence: "unica",
    tags: [],
    subtasks: [],
  }
}

// ─── Component ─────────────────────────────────────────────────────────

export function TaskForm({ open, onClose, editTask, defaultStatus }: TaskFormProps) {
  const addTask = useTasksStore((s) => s.addTask)
  const updateTask = useTasksStore((s) => s.updateTask)

  const [form, setForm] = React.useState<FormState>(() =>
    getInitial(editTask, defaultStatus)
  )
  const [errors, setErrors] = React.useState<{ title?: string }>({})
  const [loading, setLoading] = React.useState(false)

  // Tag input state
  const [tagInput, setTagInput] = React.useState("")
  const [tagColor, setTagColor] = React.useState(TAG_COLORS[5])

  // Subtask input state
  const [subtaskInput, setSubtaskInput] = React.useState("")

  React.useEffect(() => {
    if (open) {
      setForm(getInitial(editTask, defaultStatus))
      setErrors({})
      setTagInput("")
      setTagColor(TAG_COLORS[5])
      setSubtaskInput("")
    }
  }, [open, editTask, defaultStatus])

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // ─── Tags ──────────────────────────────────────────────────────────

  function addTag() {
    const label = tagInput.trim()
    if (!label) return
    const newTag: Tag = { id: genId(), label, color: tagColor }
    setField("tags", [...form.tags, newTag])
    setTagInput("")
  }

  function removeTag(id: string) {
    setField("tags", form.tags.filter((t) => t.id !== id))
  }

  // ─── Subtasks ──────────────────────────────────────────────────────

  function addSubtask() {
    const title = subtaskInput.trim()
    if (!title) return
    const newSub: Subtask = { id: genId(), title, completed: false }
    setField("subtasks", [...form.subtasks, newSub])
    setSubtaskInput("")
  }

  function removeSubtask(id: string) {
    setField("subtasks", form.subtasks.filter((s) => s.id !== id))
  }

  function toggleSubtask(id: string) {
    setField(
      "subtasks",
      form.subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    )
  }

  // ─── Submit ────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: { title?: string } = {}
    if (!form.title.trim()) newErrors.title = "Título é obrigatório"
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    await new Promise((r) => setTimeout(r, 300))

    const taskData = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || undefined,
      recurrence: form.recurrence,
      tags: form.tags,
      subtasks: form.subtasks,
      assignee: editTask?.assignee,
    }

    if (editTask) {
      updateTask(editTask.id, taskData)
      toast.success("Tarefa atualizada com sucesso!")
    } else {
      addTask(taskData)
      toast.success("Tarefa criada com sucesso!")
    }

    setLoading(false)
    onClose()
  }

  const isEditing = Boolean(editTask)

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[520px] bg-card border-border overflow-y-auto"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="text-foreground text-xl font-semibold">
            {isEditing ? "Editar Tarefa" : "Nova Tarefa"}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {isEditing
              ? "Edite as informações da tarefa."
              : "Preencha as informações para criar uma nova tarefa."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Título */}
          <div className="space-y-1.5">
            <Label className="text-foreground font-medium">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Ex: Implementar autenticação, Revisar relatório…"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              className={`bg-background border-border text-foreground placeholder:text-muted-foreground ${
                errors.title ? "border-destructive" : ""
              }`}
              disabled={loading}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label className="text-foreground font-medium">
              Descrição{" "}
              <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Textarea
              placeholder="Descreva o objetivo e detalhes desta tarefa…"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={3}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground resize-none"
              disabled={loading}
            />
          </div>

          {/* Status + Prioridade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-foreground font-medium">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setField("status", v as TaskStatus)}
                disabled={loading}
              >
                <SelectTrigger className="bg-background border-border text-foreground w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {(Object.entries(TASK_STATUS_LABELS) as [TaskStatus, string][]).map(
                    ([k, v]) => (
                      <SelectItem
                        key={k}
                        value={k}
                        className="text-foreground hover:bg-muted cursor-pointer"
                      >
                        {v}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground font-medium">Prioridade</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setField("priority", v as Priority)}
                disabled={loading}
              >
                <SelectTrigger className="bg-background border-border text-foreground w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {(Object.entries(PRIORITY_LABELS) as [Priority, string][]).map(
                    ([k, v]) => (
                      <SelectItem
                        key={k}
                        value={k}
                        className="text-foreground hover:bg-muted cursor-pointer"
                      >
                        {v}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data de vencimento + Recorrência */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-foreground font-medium">
                Data de Vencimento{" "}
                <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setField("dueDate", e.target.value)}
                className="bg-background border-border text-foreground"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground font-medium">Recorrência</Label>
              <Select
                value={form.recurrence}
                onValueChange={(v) => setField("recurrence", v as TaskRecurrence)}
                disabled={loading}
              >
                <SelectTrigger className="bg-background border-border text-foreground w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {(Object.entries(TASK_RECURRENCE_LABELS) as [TaskRecurrence, string][]).map(
                    ([k, v]) => (
                      <SelectItem
                        key={k}
                        value={k}
                        className="text-foreground hover:bg-muted cursor-pointer"
                      >
                        {v}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium">Tags</Label>

            {/* Existing Tags */}
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full text-white"
                    style={{ background: tag.color }}
                  >
                    {tag.label}
                    <button
                      type="button"
                      onClick={() => removeTag(tag.id)}
                      className="hover:opacity-70 transition-opacity cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag Input Row */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Nome da tag…"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag()
                  }
                }}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground flex-1 h-8 text-sm"
                disabled={loading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTag}
                disabled={loading || !tagInput.trim()}
                className="border-border text-foreground hover:bg-muted cursor-pointer h-8 px-2"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Color Swatches */}
            <div className="flex gap-1.5 flex-wrap">
              {TAG_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                    tagColor === c ? "border-white scale-125" : "border-transparent"
                  }`}
                  style={{ background: c }}
                  onClick={() => setTagColor(c)}
                />
              ))}
            </div>
          </div>

          {/* Subtarefas */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium">Subtarefas</Label>

            {/* Existing Subtasks */}
            {form.subtasks.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {form.subtasks.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={sub.completed}
                      onCheckedChange={() => toggleSubtask(sub.id)}
                      className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span
                      className={`flex-1 text-sm ${
                        sub.completed
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {sub.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSubtask(sub.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Subtask Row */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Nome da subtarefa…"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addSubtask()
                  }
                }}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground flex-1 h-8 text-sm"
                disabled={loading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSubtask}
                disabled={loading || !subtaskInput.trim()}
                className="border-border text-foreground hover:bg-muted cursor-pointer h-8 px-2"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Footer */}
          <SheetFooter className="pt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-border text-foreground hover:bg-muted cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer min-w-[130px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando…
                </>
              ) : isEditing ? (
                "Salvar Alterações"
              ) : (
                "Criar Tarefa"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
