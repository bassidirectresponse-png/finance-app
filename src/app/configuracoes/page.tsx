"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import {
  User,
  Palette,
  Database,
  Info,
  Sun,
  Moon,
  Monitor,
  RotateCcw,
  Download,
  Check,
} from "lucide-react"
import { toast } from "sonner"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ConfirmModal } from "@/components/shared/confirm-modal"
import { useCompanyStore, usePersonalStore, useTasksStore } from "@/lib/store"
import { cn } from "@/lib/utils"

// ─── Profile Store (localStorage) ─────────────────────────────────────

function useProfile() {
  const [profile, setProfile] = React.useState({
    name: "Guilherme Augusto",
    email: "guilherme@trackfinance.app",
    role: "Administrador",
  })

  React.useEffect(() => {
    const saved = localStorage.getItem("track-finance:profile")
    if (saved) {
      try {
        setProfile(JSON.parse(saved))
      } catch {
        /* ignore */
      }
    }
  }, [])

  function saveProfile(data: typeof profile) {
    setProfile(data)
    localStorage.setItem("track-finance:profile", JSON.stringify(data))
  }

  return { profile, saveProfile }
}

// ─── Section Card ─────────────────────────────────────────────────────

function SectionCard({
  title,
  description,
  children,
  delay = 0,
}: {
  title: string
  description?: string
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="bg-card border border-border rounded-2xl p-6"
    >
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
      <Separator className="my-4" />
      {children}
    </motion.div>
  )
}

// ─── Accent Color Option ──────────────────────────────────────────────

const ACCENT_COLORS = [
  { label: "Índigo", value: "#6366F1" },
  { label: "Violeta", value: "#8B5CF6" },
  { label: "Rosa", value: "#EC4899" },
  { label: "Verde", value: "#10B981" },
  { label: "Ciano", value: "#06B6D4" },
  { label: "Laranja", value: "#F97316" },
  { label: "Vermelho", value: "#EF4444" },
  { label: "Azul", value: "#3B82F6" },
]

// ─── Page ─────────────────────────────────────────────────────────────

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme()
  const { profile, saveProfile } = useProfile()
  const resetCompany = useCompanyStore((s) => s.resetToMockData)
  const resetPersonal = usePersonalStore((s) => s.resetToMockData)
  const resetTasks = useTasksStore((s) => s.resetToMockData)

  // Local form state for profile
  const [formName, setFormName] = React.useState(profile.name)
  const [formEmail, setFormEmail] = React.useState(profile.email)
  const [formRole, setFormRole] = React.useState(profile.role)
  const [profileSaved, setProfileSaved] = React.useState(false)

  React.useEffect(() => {
    setFormName(profile.name)
    setFormEmail(profile.email)
    setFormRole(profile.role)
  }, [profile])

  // Accent color state
  const [accentColor, setAccentColor] = React.useState("#6366F1")

  React.useEffect(() => {
    const saved = localStorage.getItem("track-finance:accent")
    if (saved) setAccentColor(saved)
  }, [])

  function handleAccentChange(color: string) {
    setAccentColor(color)
    localStorage.setItem("track-finance:accent", color)
    toast.success("Cor de destaque atualizada")
  }

  // Reset modals
  const [resetTarget, setResetTarget] = React.useState<
    "company" | "personal" | "tasks" | "all" | null
  >(null)

  function handleReset() {
    if (!resetTarget) return
    if (resetTarget === "company" || resetTarget === "all") resetCompany()
    if (resetTarget === "personal" || resetTarget === "all") resetPersonal()
    if (resetTarget === "tasks" || resetTarget === "all") resetTasks()
    toast.success(
      resetTarget === "all"
        ? "Todos os dados foram restaurados!"
        : "Dados restaurados com sucesso!"
    )
    setResetTarget(null)
  }

  // Save profile
  function handleSaveProfile() {
    saveProfile({ name: formName, email: formEmail, role: formRole })
    setProfileSaved(true)
    toast.success("Perfil salvo com sucesso!")
    setTimeout(() => setProfileSaved(false), 2000)
  }

  // Initials
  const initials = formName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("")

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gerencie suas preferências, aparência e dados do sistema
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="bg-muted rounded-lg p-1 h-auto flex-wrap">
          <TabsTrigger
            value="perfil"
            className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            Perfil
          </TabsTrigger>
          <TabsTrigger
            value="aparencia"
            className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer gap-1.5"
          >
            <Palette className="w-3.5 h-3.5" />
            Aparência
          </TabsTrigger>
          <TabsTrigger
            value="dados"
            className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer gap-1.5"
          >
            <Database className="w-3.5 h-3.5" />
            Dados
          </TabsTrigger>
          <TabsTrigger
            value="sobre"
            className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer gap-1.5"
          >
            <Info className="w-3.5 h-3.5" />
            Sobre
          </TabsTrigger>
        </TabsList>

        {/* ──── Tab: Perfil ──── */}
        <TabsContent value="perfil" className="space-y-4 mt-0">
          <SectionCard title="Informações do Perfil" description="Seus dados pessoais e avatar">
            <div className="flex items-center gap-4 mb-6">
              {/* Avatar */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                style={{ background: accentColor }}
              >
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{formName}</p>
                <p className="text-xs text-muted-foreground">{formRole}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs text-muted-foreground">
                  Nome completo
                </Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Seu nome"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs text-muted-foreground">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-xs text-muted-foreground">
                  Cargo / Função
                </Label>
                <Input
                  id="role"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  placeholder="Ex: Administrador"
                  className="bg-background border-border"
                />
              </div>

              <Button
                onClick={handleSaveProfile}
                className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer gap-2"
              >
                {profileSaved ? (
                  <Check className="w-4 h-4" />
                ) : null}
                {profileSaved ? "Salvo!" : "Salvar Perfil"}
              </Button>
            </div>
          </SectionCard>
        </TabsContent>

        {/* ──── Tab: Aparência ──── */}
        <TabsContent value="aparencia" className="space-y-4 mt-0">
          <SectionCard title="Tema" description="Escolha entre claro, escuro ou automático" delay={0.05}>
            <div className="flex items-center gap-3">
              {(
                [
                  { value: "light", label: "Claro", icon: Sun },
                  { value: "dark", label: "Escuro", icon: Moon },
                  { value: "system", label: "Sistema", icon: Monitor },
                ] as const
              ).map((opt) => {
                const Icon = opt.icon
                const isActive = theme === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer flex-1",
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {opt.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </SectionCard>

          <SectionCard title="Cor de Destaque" description="Personalize a cor primária da interface" delay={0.1}>
            <div className="flex flex-wrap gap-3">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => handleAccentChange(c.value)}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border-2",
                    accentColor === c.value
                      ? "border-foreground scale-110 shadow-lg"
                      : "border-transparent hover:scale-105"
                  )}
                  style={{ background: c.value }}
                  title={c.label}
                >
                  {accentColor === c.value && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        {/* ──── Tab: Dados ──── */}
        <TabsContent value="dados" className="space-y-4 mt-0">
          <SectionCard
            title="Gerenciamento de Dados"
            description="Restaure os dados de demonstração ou exporte seus dados"
            delay={0.05}
          >
            <div className="space-y-4">
              {/* Reset individual stores */}
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Restaurar dados de demonstração
                </p>

                {(
                  [
                    { key: "company" as const, label: "Gastos da Empresa" },
                    { key: "personal" as const, label: "Gastos Pessoais" },
                    { key: "tasks" as const, label: "Tarefas" },
                  ] as const
                ).map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Restaurar dados originais de {item.label.toLowerCase()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setResetTarget(item.key)}
                      className="cursor-pointer gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restaurar
                    </Button>
                  </div>
                ))}

                <Separator />

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-red-500">
                      Restaurar todos os dados
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Isso vai restaurar todos os dados para os valores de
                      demonstração
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setResetTarget("all")}
                    className="cursor-pointer gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restaurar Tudo
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Export */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Exportar Dados
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Baixar todos os dados em formato JSON
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer gap-1.5"
                  onClick={() => {
                    const data = {
                      company: useCompanyStore.getState().expenses,
                      personal: usePersonalStore.getState().expenses,
                      tasks: useTasksStore.getState().tasks,
                      profile,
                      exportedAt: new Date().toISOString(),
                    }
                    const blob = new Blob([JSON.stringify(data, null, 2)], {
                      type: "application/json",
                    })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = `track-finance-export-${new Date()
                      .toISOString()
                      .slice(0, 10)}.json`
                    a.click()
                    URL.revokeObjectURL(url)
                    toast.success("Dados exportados com sucesso!")
                  }}
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar JSON
                </Button>
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        {/* ──── Tab: Sobre ──── */}
        <TabsContent value="sobre" className="space-y-4 mt-0">
          <SectionCard title="Sobre o Track Finance" delay={0.05}>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground text-lg font-bold">T</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Track Finance
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Controle Financeiro Premium
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                {[
                  { label: "Versão", value: "1.0.0" },
                  { label: "Framework", value: "Next.js 16 + React 19" },
                  { label: "UI", value: "Radix UI + Tailwind CSS 4" },
                  { label: "State", value: "Zustand + localStorage" },
                  { label: "Charts", value: "Recharts" },
                  { label: "Animações", value: "Framer Motion" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs text-muted-foreground">
                      {item.label}
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              <p className="text-xs text-muted-foreground leading-relaxed">
                Sistema de controle financeiro para gerenciar despesas
                empresariais e pessoais, com dashboard analítico, gráficos
                interativos e gerenciador de tarefas integrado.
              </p>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        open={resetTarget !== null}
        onClose={() => setResetTarget(null)}
        onConfirm={handleReset}
        title="Restaurar Dados"
        description={
          resetTarget === "all"
            ? "Tem certeza que deseja restaurar TODOS os dados para os valores de demonstração? Esta ação não pode ser desfeita."
            : "Tem certeza que deseja restaurar esses dados para os valores de demonstração? Esta ação não pode ser desfeita."
        }
        confirmLabel="Restaurar"
        variant="destructive"
      />
    </div>
  )
}
