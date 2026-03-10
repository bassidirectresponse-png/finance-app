"use client"

import * as React from "react"
import { toast } from "sonner"
import { Loader2, Paperclip } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useCompanyStore } from "@/lib/store"
import { COMPANY_CATEGORIES } from "@/lib/data"
import type { CompanyExpense, CompanyCategory, RecurrenceType } from "@/lib/types"

// ─── Props ────────────────────────────────────────────────────────────

interface ExpenseFormProps {
  open: boolean
  onClose: () => void
  editExpense?: CompanyExpense | null
}

// ─── Form State ───────────────────────────────────────────────────────

interface FormData {
  title: string
  category: CompanyCategory | ""
  value: string
  date: string
  recurrence: RecurrenceType
  notes: string
  attachment: string
}

interface FormErrors {
  title?: string
  category?: string
  value?: string
  date?: string
  notes?: string
}

function getInitialData(editExpense?: CompanyExpense | null): FormData {
  if (editExpense) {
    return {
      title: editExpense.title,
      category: editExpense.category,
      value: String(editExpense.value),
      date: editExpense.date,
      recurrence: editExpense.recurrence,
      notes: editExpense.notes ?? "",
      attachment: editExpense.attachment ?? "",
    }
  }
  return {
    title: "",
    category: "",
    value: "",
    date: new Date().toISOString().slice(0, 10),
    recurrence: "unico",
    notes: "",
    attachment: "",
  }
}

// ─── Component ────────────────────────────────────────────────────────

export function ExpenseForm({ open, onClose, editExpense }: ExpenseFormProps) {
  const addExpense = useCompanyStore((s) => s.addExpense)
  const updateExpense = useCompanyStore((s) => s.updateExpense)

  const [form, setForm] = React.useState<FormData>(() => getInitialData(editExpense))
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [loading, setLoading] = React.useState(false)

  // Reset form when sheet opens/closes or editExpense changes
  React.useEffect(() => {
    if (open) {
      setForm(getInitialData(editExpense))
      setErrors({})
    }
  }, [open, editExpense])

  // ─── Validation ────────────────────────────────────────────────────

  function validate(): boolean {
    const newErrors: FormErrors = {}

    if (!form.title.trim()) {
      newErrors.title = "Título é obrigatório"
    } else if (form.title.trim().length < 2) {
      newErrors.title = "Título deve ter pelo menos 2 caracteres"
    }

    if (!form.category) {
      newErrors.category = "Categoria é obrigatória"
    }

    const numValue = parseFloat(form.value.replace(",", "."))
    if (!form.value) {
      newErrors.value = "Valor é obrigatório"
    } else if (isNaN(numValue) || numValue < 0.01) {
      newErrors.value = "Valor deve ser maior que R$ 0,01"
    }

    if (!form.date) {
      newErrors.date = "Data é obrigatória"
    }

    if (form.notes.length > 500) {
      newErrors.notes = "Observações deve ter no máximo 500 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ─── Submit ────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 400))

    const numValue = parseFloat(form.value.replace(",", "."))

    const expenseData = {
      title: form.title.trim(),
      category: form.category as CompanyCategory,
      value: numValue,
      date: form.date,
      recurrence: form.recurrence,
      notes: form.notes.trim() || undefined,
      attachment: form.attachment.trim() || undefined,
    }

    if (editExpense) {
      updateExpense(editExpense.id, expenseData)
      toast.success("Gasto atualizado com sucesso!")
    } else {
      addExpense(expenseData)
      toast.success("Gasto adicionado com sucesso!")
    }

    setLoading(false)
    onClose()
  }

  // ─── Helpers ───────────────────────────────────────────────────────

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  const isEditing = Boolean(editExpense)

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] bg-card border-border overflow-y-auto"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="text-foreground text-xl font-semibold">
            {isEditing ? "Editar Gasto" : "Adicionar Gasto"}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {isEditing
              ? "Edite as informações do gasto da empresa."
              : "Preencha as informações do novo gasto da empresa."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Título */}
          <div className="space-y-1.5">
            <Label htmlFor="expense-title" className="text-foreground font-medium">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="expense-title"
              type="text"
              placeholder="Ex: Google Ads, Salário Desenvolvedor…"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              className={`bg-background border-border text-foreground placeholder:text-muted-foreground ${
                errors.title ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
              disabled={loading}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Categoria */}
          <div className="space-y-1.5">
            <Label className="text-foreground font-medium">
              Categoria <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.category}
              onValueChange={(val) => setField("category", val as CompanyCategory)}
              disabled={loading}
            >
              <SelectTrigger
                className={`bg-background border-border text-foreground w-full ${
                  errors.category ? "border-destructive" : ""
                }`}
              >
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {(Object.entries(COMPANY_CATEGORIES) as [CompanyCategory, string][]).map(
                  ([key, label]) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="text-foreground hover:bg-muted cursor-pointer"
                    >
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category}</p>
            )}
          </div>

          {/* Valor */}
          <div className="space-y-1.5">
            <Label htmlFor="expense-value" className="text-foreground font-medium">
              Valor (R$) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="expense-value"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              value={form.value}
              onChange={(e) => setField("value", e.target.value)}
              className={`bg-background border-border text-foreground placeholder:text-muted-foreground ${
                errors.value ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Informe o valor em reais (ex: 1250.00)
            </p>
            {errors.value && (
              <p className="text-xs text-destructive">{errors.value}</p>
            )}
          </div>

          {/* Data */}
          <div className="space-y-1.5">
            <Label htmlFor="expense-date" className="text-foreground font-medium">
              Data <span className="text-destructive">*</span>
            </Label>
            <Input
              id="expense-date"
              type="date"
              value={form.date}
              onChange={(e) => setField("date", e.target.value)}
              className={`bg-background border-border text-foreground ${
                errors.date ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
              disabled={loading}
            />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date}</p>
            )}
          </div>

          {/* Recorrência */}
          <div className="space-y-1.5">
            <Label className="text-foreground font-medium">Recorrência</Label>
            <Select
              value={form.recurrence}
              onValueChange={(val) => setField("recurrence", val as RecurrenceType)}
              disabled={loading}
            >
              <SelectTrigger className="bg-background border-border text-foreground w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="unico" className="text-foreground hover:bg-muted cursor-pointer">
                  Único
                </SelectItem>
                <SelectItem value="fixo_mensal" className="text-foreground hover:bg-muted cursor-pointer">
                  Fixo Mensal
                </SelectItem>
                <SelectItem value="fixo_anual" className="text-foreground hover:bg-muted cursor-pointer">
                  Fixo Anual
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <Label htmlFor="expense-notes" className="text-foreground font-medium">
              Observações{" "}
              <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
            </Label>
            <Textarea
              id="expense-notes"
              placeholder="Adicione notas ou detalhes sobre este gasto…"
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              rows={3}
              className={`bg-background border-border text-foreground placeholder:text-muted-foreground resize-none ${
                errors.notes ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
              disabled={loading}
            />
            <div className="flex justify-between items-center">
              {errors.notes ? (
                <p className="text-xs text-destructive">{errors.notes}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {form.notes.length}/500
              </p>
            </div>
          </div>

          {/* Anexo */}
          <div className="space-y-1.5">
            <Label htmlFor="expense-attachment" className="text-foreground font-medium">
              Anexo{" "}
              <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
            </Label>
            <div className="relative">
              <Input
                id="expense-attachment"
                type="text"
                placeholder="Nome do arquivo (ex: nota-fiscal.pdf)"
                value={form.attachment}
                onChange={(e) => setField("attachment", e.target.value)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground pr-10"
                disabled={loading}
              />
              <Paperclip className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            <p className="text-xs text-muted-foreground">
              Informe o nome do arquivo (sem upload real)
            </p>
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
              className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando…
                </>
              ) : (
                "Salvar Gasto"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
