"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { usePersonalStore } from "@/lib/store"
import { PERSONAL_CATEGORIES } from "@/lib/data"
import type { PersonalExpense, PersonalCategory, RecurrenceType } from "@/lib/types"

interface PersonalFormProps {
  open: boolean
  onClose: () => void
  editExpense?: PersonalExpense | null
}

interface FormValues {
  title: string
  category: PersonalCategory
  value: string
  date: string
  recurrence: RecurrenceType
  notes: string
  // Debt fields
  totalDebt: string
  installmentValue: string
  totalInstallments: string
  paidInstallments: string
}

const DEBT_CATEGORIES: PersonalCategory[] = ["dividas_emprestimos", "dividas_pessoais"]

export function PersonalForm({ open, onClose, editExpense }: PersonalFormProps) {
  const { addExpense, updateExpense } = usePersonalStore()

  const defaultValues: FormValues = React.useMemo(() => ({
    title: editExpense?.title ?? "",
    category: editExpense?.category ?? "gastos_mensais_fixos",
    value: editExpense?.value?.toString() ?? "",
    date: editExpense?.date ?? new Date().toISOString().slice(0, 10),
    recurrence: editExpense?.recurrence ?? "unico",
    notes: editExpense?.notes ?? "",
    totalDebt: editExpense?.totalDebt?.toString() ?? "",
    installmentValue: editExpense?.installmentValue?.toString() ?? "",
    totalInstallments: editExpense?.totalInstallments?.toString() ?? "",
    paidInstallments: editExpense?.paidInstallments?.toString() ?? "",
  }), [editExpense])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues })

  const selectedCategory = watch("category")
  const totalInstallmentsVal = watch("totalInstallments")
  const paidInstallmentsVal = watch("paidInstallments")
  const isDebtCategory = DEBT_CATEGORIES.includes(selectedCategory as PersonalCategory)

  // Reset form when dialog opens/closes or editExpense changes
  React.useEffect(() => {
    if (open) {
      reset(defaultValues)
    }
  }, [open, reset, defaultValues])

  function onSubmit(data: FormValues) {
    const value = parseFloat(data.value)
    if (isNaN(value) || value <= 0) {
      toast.error("Valor inválido. Informe um valor maior que zero.")
      return
    }

    const totalInst = data.totalInstallments ? parseInt(data.totalInstallments, 10) : undefined
    const paidInst = data.paidInstallments ? parseInt(data.paidInstallments, 10) : undefined

    if (isDebtCategory && totalInst != null && paidInst != null && paidInst > totalInst) {
      toast.error("Parcelas pagas não pode ser maior que o total de parcelas.")
      return
    }

    const payload: Omit<PersonalExpense, "id" | "createdAt"> = {
      title: data.title.trim(),
      category: data.category,
      value,
      date: data.date,
      recurrence: data.recurrence,
      notes: data.notes.trim() || undefined,
      ...(isDebtCategory && {
        totalDebt: data.totalDebt ? parseFloat(data.totalDebt) : undefined,
        installmentValue: data.installmentValue ? parseFloat(data.installmentValue) : undefined,
        totalInstallments: totalInst,
        paidInstallments: paidInst,
      }),
    }

    if (editExpense) {
      updateExpense(editExpense.id, payload)
      toast.success("Gasto atualizado com sucesso!")
    } else {
      addExpense(payload)
      toast.success("Gasto adicionado com sucesso!")
    }

    onClose()
    reset(defaultValues)
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto bg-card border-border"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="text-foreground">
            {editExpense ? "Editar Gasto" : "Novo Gasto Pessoal"}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {editExpense
              ? "Atualize as informações do gasto pessoal."
              : "Preencha os dados para adicionar um novo gasto pessoal."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Título */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-foreground text-sm">
              Título <span className="text-[#FF1744]">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Ex: Academia, Aluguel, Netflix..."
              className="bg-background border-border text-foreground"
              {...register("title", { required: "Título é obrigatório" })}
            />
            {errors.title && (
              <p className="text-xs text-[#FF1744]">{errors.title.message}</p>
            )}
          </div>

          {/* Categoria */}
          <div className="space-y-1.5">
            <Label className="text-foreground text-sm">
              Categoria <span className="text-[#FF1744]">*</span>
            </Label>
            <Select
              value={selectedCategory}
              onValueChange={(val) => setValue("category", val as PersonalCategory)}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {Object.entries(PERSONAL_CATEGORIES).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-foreground cursor-pointer">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Valor */}
          <div className="space-y-1.5">
            <Label htmlFor="value" className="text-foreground text-sm">
              Valor (R$) <span className="text-[#FF1744]">*</span>
            </Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              className="bg-background border-border text-foreground"
              {...register("value", { required: "Valor é obrigatório" })}
            />
            {errors.value && (
              <p className="text-xs text-[#FF1744]">{errors.value.message}</p>
            )}
          </div>

          {/* Data */}
          <div className="space-y-1.5">
            <Label htmlFor="date" className="text-foreground text-sm">
              Data <span className="text-[#FF1744]">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              className="bg-background border-border text-foreground"
              {...register("date", { required: "Data é obrigatória" })}
            />
            {errors.date && (
              <p className="text-xs text-[#FF1744]">{errors.date.message}</p>
            )}
          </div>

          {/* Recorrência */}
          <div className="space-y-1.5">
            <Label className="text-foreground text-sm">Recorrência</Label>
            <Select
              value={watch("recurrence")}
              onValueChange={(val) => setValue("recurrence", val as RecurrenceType)}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Selecione a recorrência" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="unico" className="text-foreground cursor-pointer">Único</SelectItem>
                <SelectItem value="fixo_mensal" className="text-foreground cursor-pointer">Fixo Mensal</SelectItem>
                <SelectItem value="fixo_anual" className="text-foreground cursor-pointer">Fixo Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-foreground text-sm">
              Observações
            </Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Observações opcionais..."
              className="bg-background border-border text-foreground resize-none"
              {...register("notes")}
            />
          </div>

          {/* Debt tracking section */}
          {isDebtCategory && (
            <>
              <div className="relative my-2">
                <Separator className="bg-border" />
                <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground font-medium">
                  Controle de Parcelas
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Total da dívida */}
                <div className="space-y-1.5">
                  <Label htmlFor="totalDebt" className="text-foreground text-sm">
                    Total da dívida
                  </Label>
                  <Input
                    id="totalDebt"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    className="bg-background border-border text-foreground"
                    {...register("totalDebt")}
                  />
                </div>

                {/* Valor da parcela */}
                <div className="space-y-1.5">
                  <Label htmlFor="installmentValue" className="text-foreground text-sm">
                    Valor da parcela
                  </Label>
                  <Input
                    id="installmentValue"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    className="bg-background border-border text-foreground"
                    {...register("installmentValue")}
                  />
                </div>

                {/* Total de parcelas */}
                <div className="space-y-1.5">
                  <Label htmlFor="totalInstallments" className="text-foreground text-sm">
                    Total de parcelas
                  </Label>
                  <Input
                    id="totalInstallments"
                    type="number"
                    step="1"
                    min="1"
                    placeholder="Ex: 48"
                    className="bg-background border-border text-foreground"
                    {...register("totalInstallments")}
                  />
                </div>

                {/* Parcelas pagas */}
                <div className="space-y-1.5">
                  <Label htmlFor="paidInstallments" className="text-foreground text-sm">
                    Parcelas pagas
                  </Label>
                  <Input
                    id="paidInstallments"
                    type="number"
                    step="1"
                    min="0"
                    placeholder="Ex: 12"
                    className="bg-background border-border text-foreground"
                    {...register("paidInstallments")}
                  />
                  {totalInstallmentsVal &&
                    paidInstallmentsVal &&
                    parseInt(paidInstallmentsVal, 10) > parseInt(totalInstallmentsVal, 10) && (
                      <p className="text-xs text-[#FF1744]">
                        Não pode ser maior que o total de parcelas.
                      </p>
                    )}
                </div>
              </div>
            </>
          )}

          <SheetFooter className="pt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-border text-foreground hover:bg-muted cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              {editExpense ? "Salvar alterações" : "Adicionar gasto"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
