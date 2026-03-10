/**
 * data.ts
 * Mock data and category label maps for Track Finance
 * Realistic Brazilian financial data — Oct 2025 → Mar 2026
 */

import type {
  CompanyExpense,
  CompanyCategory,
  PersonalExpense,
  PersonalCategory,
  Task,
  TaskRecurrence,
  MonthlyData,
} from './types'

// ─── Category Label Maps ─────────────────────────────────────────────

export const COMPANY_CATEGORIES: Record<CompanyCategory, string> = {
  software_ferramentas: 'Software & Ferramentas',
  apps_assinaturas: 'Aplicativos & Assinaturas',
  anuncios_marketing: 'Anúncios & Marketing',
  impostos_taxas: 'Impostos & Taxas',
  chargeback: 'Chargeback',
  reembolsos: 'Reembolsos',
  pagamento_colaboradores: 'Pagamento de Colaboradores',
  infraestrutura: 'Infraestrutura',
  outros: 'Outros',
}

export const PERSONAL_CATEGORIES: Record<PersonalCategory, string> = {
  dividas_emprestimos: 'Dívidas & Empréstimos',
  gastos_mensais_fixos: 'Gastos Mensais Fixos',
  cartao_credito: 'Cartão de Crédito',
  dividas_pessoais: 'Dívidas Pessoais',
  lazer_entretenimento: 'Lazer & Entretenimento',
  saude: 'Saúde',
  alimentacao: 'Alimentação',
  outros: 'Outros',
}

// ─── Category Colors ──────────────────────────────────────────────────

export const COMPANY_CATEGORY_COLORS: Record<CompanyCategory, string> = {
  software_ferramentas: '#6366F1',
  apps_assinaturas: '#8B5CF6',
  anuncios_marketing: '#F59E0B',
  impostos_taxas: '#F43F5E',
  chargeback: '#FF1744',
  reembolsos: '#06B6D4',
  pagamento_colaboradores: '#10B981',
  infraestrutura: '#F97316',
  outros: '#9CA3AF',
}

export const PERSONAL_CATEGORY_COLORS: Record<PersonalCategory, string> = {
  dividas_emprestimos: '#FF1744',
  gastos_mensais_fixos: '#6366F1',
  cartao_credito: '#F43F5E',
  dividas_pessoais: '#F97316',
  lazer_entretenimento: '#F59E0B',
  saude: '#10B981',
  alimentacao: '#06B6D4',
  outros: '#9CA3AF',
}

// ─── Mock Company Expenses ────────────────────────────────────────────

export const MOCK_COMPANY_EXPENSES: CompanyExpense[] = [
  {
    id: 'ce-001',
    title: 'Google Ads',
    category: 'anuncios_marketing',
    value: 3200,
    date: '2026-03-01',
    recurrence: 'fixo_mensal',
    notes: 'Campanhas de search e display — março/26',
    nextDueDate: '2026-04-01',
    createdAt: '2025-10-01T08:00:00.000Z',
  },
  {
    id: 'ce-002',
    title: 'Meta Ads (Facebook + Instagram)',
    category: 'anuncios_marketing',
    value: 2800,
    date: '2026-03-01',
    recurrence: 'fixo_mensal',
    notes: 'Campanhas de remarketing e topo de funil',
    nextDueDate: '2026-04-01',
    createdAt: '2025-10-01T08:00:00.000Z',
  },
  {
    id: 'ce-003',
    title: 'AWS (EC2 + RDS + S3)',
    category: 'infraestrutura',
    value: 890,
    date: '2026-03-05',
    recurrence: 'fixo_mensal',
    notes: 'Infraestrutura cloud principal — produção e staging',
    nextDueDate: '2026-04-05',
    createdAt: '2025-10-01T08:00:00.000Z',
  },
  {
    id: 'ce-004',
    title: 'Notion + Figma (Planos Team)',
    category: 'software_ferramentas',
    value: 450,
    date: '2026-03-10',
    recurrence: 'fixo_mensal',
    notes: 'Licenças para equipe de 8 pessoas',
    nextDueDate: '2026-04-10',
    createdAt: '2025-10-01T08:00:00.000Z',
  },
  {
    id: 'ce-005',
    title: 'Simples Nacional — Março',
    category: 'impostos_taxas',
    value: 2100,
    date: '2026-03-20',
    recurrence: 'fixo_mensal',
    notes: 'DAS — Documento de Arrecadação do Simples Nacional',
    nextDueDate: '2026-04-20',
    createdAt: '2025-10-01T08:00:00.000Z',
  },
  {
    id: 'ce-006',
    title: 'Salário Dev Frontend Sênior',
    category: 'pagamento_colaboradores',
    value: 9500,
    date: '2026-03-05',
    recurrence: 'fixo_mensal',
    notes: 'CLT — inclui 13º proporcional e férias',
    nextDueDate: '2026-04-05',
    createdAt: '2025-10-01T08:00:00.000Z',
  },
  {
    id: 'ce-007',
    title: 'Salário Dev Backend Pleno',
    category: 'pagamento_colaboradores',
    value: 7500,
    date: '2026-03-05',
    recurrence: 'fixo_mensal',
    notes: 'PJ — contrato de prestação de serviços',
    nextDueDate: '2026-04-05',
    createdAt: '2025-10-01T08:00:00.000Z',
  },
  {
    id: 'ce-008',
    title: 'Salário Designer UX/UI',
    category: 'pagamento_colaboradores',
    value: 6200,
    date: '2026-03-05',
    recurrence: 'fixo_mensal',
    notes: 'PJ — contrato mensal',
    nextDueDate: '2026-04-05',
    createdAt: '2025-10-01T08:00:00.000Z',
  },
  {
    id: 'ce-009',
    title: 'Chargeback — Transação #TRX-4821',
    category: 'chargeback',
    value: 350,
    date: '2026-02-18',
    recurrence: 'unico',
    notes: 'Cliente contestou compra junto ao banco — cartão Visa',
    createdAt: '2026-02-18T14:30:00.000Z',
  },
  {
    id: 'ce-010',
    title: 'Vercel Pro (Hospedagem Frontend)',
    category: 'infraestrutura',
    value: 120,
    date: '2026-03-01',
    recurrence: 'fixo_mensal',
    notes: 'Deploy do Next.js — bandwidth ilimitado',
    nextDueDate: '2026-04-01',
    createdAt: '2025-10-01T08:00:00.000Z',
  },
  {
    id: 'ce-011',
    title: 'GitHub Teams',
    category: 'software_ferramentas',
    value: 85,
    date: '2026-03-01',
    recurrence: 'fixo_mensal',
    notes: '5 usuários × $4/mês (cotação R$5,07)',
    nextDueDate: '2026-04-01',
    createdAt: '2025-10-01T08:00:00.000Z',
  },
  {
    id: 'ce-012',
    title: 'Slack Business+',
    category: 'apps_assinaturas',
    value: 210,
    date: '2026-03-01',
    recurrence: 'fixo_mensal',
    notes: 'Comunicação interna da equipe',
    nextDueDate: '2026-04-01',
    createdAt: '2025-10-01T08:00:00.000Z',
  },
  {
    id: 'ce-013',
    title: 'Reembolso — Viagem SP (João)',
    category: 'reembolsos',
    value: 680,
    date: '2026-02-22',
    recurrence: 'unico',
    notes: 'Passagem aérea + hotel — reunião com cliente',
    createdAt: '2026-02-22T09:00:00.000Z',
  },
  {
    id: 'ce-014',
    title: 'Domínio + SSL Wildcard (Registro.br)',
    category: 'infraestrutura',
    value: 380,
    date: '2025-11-15',
    recurrence: 'fixo_anual',
    notes: 'Renovação anual — domínios .com.br e .app',
    nextDueDate: '2026-11-15',
    createdAt: '2025-11-15T10:00:00.000Z',
  },
  {
    id: 'ce-015',
    title: 'TikTok Ads',
    category: 'anuncios_marketing',
    value: 1500,
    date: '2026-02-01',
    recurrence: 'fixo_mensal',
    notes: 'Campanhas de awareness — público 18-35 anos',
    nextDueDate: '2026-03-01',
    createdAt: '2025-12-01T08:00:00.000Z',
  },
  {
    id: 'ce-016',
    title: 'Zendesk Support (CRM)',
    category: 'software_ferramentas',
    value: 340,
    date: '2026-01-10',
    recurrence: 'fixo_mensal',
    notes: 'Suporte ao cliente — 3 agentes',
    nextDueDate: '2026-02-10',
    createdAt: '2025-10-10T08:00:00.000Z',
  },
  {
    id: 'ce-017',
    title: 'Consultoria Contábil — Janeiro',
    category: 'outros',
    value: 1200,
    date: '2026-01-31',
    recurrence: 'fixo_mensal',
    notes: 'Abertura de balanço + folha de pagamento',
    nextDueDate: '2026-02-28',
    createdAt: '2026-01-31T11:00:00.000Z',
  },
  {
    id: 'ce-018',
    title: 'Adobe Creative Cloud Teams',
    category: 'apps_assinaturas',
    value: 560,
    date: '2025-12-01',
    recurrence: 'fixo_mensal',
    notes: 'Photoshop, Illustrator, After Effects — 2 licenças',
    nextDueDate: '2026-01-01',
    createdAt: '2025-10-01T08:00:00.000Z',
  },
  {
    id: 'ce-019',
    title: 'Chargeback — Transação #TRX-3992',
    category: 'chargeback',
    value: 189,
    date: '2025-12-10',
    recurrence: 'unico',
    notes: 'Estorno processado pela operadora Mastercard',
    createdAt: '2025-12-10T16:00:00.000Z',
  },
  {
    id: 'ce-020',
    title: 'Cloudflare Pro (CDN + DDoS)',
    category: 'infraestrutura',
    value: 110,
    date: '2025-11-01',
    recurrence: 'fixo_mensal',
    notes: 'Proteção e performance de rede',
    nextDueDate: '2025-12-01',
    createdAt: '2025-11-01T08:00:00.000Z',
  },
  {
    id: 'ce-021',
    title: 'Patrocínio Podcast FinTech Brasil',
    category: 'anuncios_marketing',
    value: 2500,
    date: '2025-10-20',
    recurrence: 'unico',
    notes: '2 episódios — menção de marca + link na descrição',
    createdAt: '2025-10-20T08:00:00.000Z',
  },
  {
    id: 'ce-022',
    title: 'Curso NR-35 Equipe (SENAI)',
    category: 'outros',
    value: 490,
    date: '2025-10-15',
    recurrence: 'unico',
    notes: 'Treinamento obrigatório — 5 colaboradores',
    createdAt: '2025-10-15T08:00:00.000Z',
  },
  {
    id: 'ce-023',
    title: 'ISS — Nota Fiscal Serviços',
    category: 'impostos_taxas',
    value: 625,
    date: '2026-02-15',
    recurrence: 'fixo_mensal',
    notes: 'ISS municipal 5% sobre serviços prestados',
    nextDueDate: '2026-03-15',
    createdAt: '2025-10-01T08:00:00.000Z',
  },
]

// ─── Mock Personal Expenses ────────────────────────────────────────────

export const MOCK_PERSONAL_EXPENSES: PersonalExpense[] = [
  {
    id: 'pe-001',
    title: 'Financiamento Honda Civic',
    category: 'dividas_emprestimos',
    value: 1200,
    date: '2026-03-10',
    recurrence: 'fixo_mensal',
    notes: 'Parcela #18/48 — Banco Bradesco',
    totalDebt: 57600,
    installmentValue: 1200,
    totalInstallments: 48,
    paidInstallments: 18,
    nextDueDate: '2026-04-10',
    createdAt: '2024-09-10T00:00:00.000Z',
  },
  {
    id: 'pe-002',
    title: 'Netflix + Spotify + Disney+',
    category: 'gastos_mensais_fixos',
    value: 89,
    date: '2026-03-05',
    recurrence: 'fixo_mensal',
    notes: 'Pacote streaming — planos familiares',
    nextDueDate: '2026-04-05',
    createdAt: '2025-01-05T00:00:00.000Z',
  },
  {
    id: 'pe-003',
    title: 'Fatura Cartão Nubank — Fevereiro',
    category: 'cartao_credito',
    value: 3400,
    date: '2026-03-15',
    recurrence: 'fixo_mensal',
    notes: 'Inclui compras do exterior + assinaturas',
    nextDueDate: '2026-04-15',
    createdAt: '2025-10-01T00:00:00.000Z',
  },
  {
    id: 'pe-004',
    title: 'Academia Smart Fit',
    category: 'saude',
    value: 180,
    date: '2026-03-01',
    recurrence: 'fixo_mensal',
    notes: 'Plano Black — todos os Smart Fits',
    nextDueDate: '2026-04-01',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'pe-005',
    title: 'Empréstimo Pessoal — Nubank',
    category: 'dividas_pessoais',
    value: 750,
    date: '2026-03-20',
    recurrence: 'fixo_mensal',
    notes: 'Parcela #5/24 — taxa 2,1% a.m.',
    totalDebt: 18000,
    installmentValue: 750,
    totalInstallments: 24,
    paidInstallments: 5,
    nextDueDate: '2026-04-20',
    createdAt: '2025-11-20T00:00:00.000Z',
  },
  {
    id: 'pe-006',
    title: 'Aluguel Apartamento',
    category: 'gastos_mensais_fixos',
    value: 2800,
    date: '2026-03-05',
    recurrence: 'fixo_mensal',
    notes: 'Aluguel + condomínio + IPTU',
    nextDueDate: '2026-04-05',
    createdAt: '2024-04-05T00:00:00.000Z',
  },
  {
    id: 'pe-007',
    title: 'Plano de Saúde (SulAmérica)',
    category: 'saude',
    value: 620,
    date: '2026-03-10',
    recurrence: 'fixo_mensal',
    notes: 'Plano individual — cobertura nacional',
    nextDueDate: '2026-04-10',
    createdAt: '2023-04-10T00:00:00.000Z',
  },
  {
    id: 'pe-008',
    title: 'Supermercado Mensal',
    category: 'alimentacao',
    value: 1100,
    date: '2026-03-08',
    recurrence: 'fixo_mensal',
    notes: 'Pão de Açúcar + feira de bairro',
    nextDueDate: '2026-04-08',
    createdAt: '2025-10-01T00:00:00.000Z',
  },
  {
    id: 'pe-009',
    title: 'iFood (Refeições)',
    category: 'alimentacao',
    value: 480,
    date: '2026-03-01',
    recurrence: 'fixo_mensal',
    notes: 'Média de ~R$ 16/dia em dias úteis',
    nextDueDate: '2026-04-01',
    createdAt: '2025-10-01T00:00:00.000Z',
  },
  {
    id: 'pe-010',
    title: 'Cinema + Jantar (Lazer)',
    category: 'lazer_entretenimento',
    value: 320,
    date: '2026-02-22',
    recurrence: 'unico',
    notes: 'Aniversário da Ana — jantar no Outback + cinema',
    createdAt: '2026-02-22T00:00:00.000Z',
  },
  {
    id: 'pe-011',
    title: 'Consulta Médica + Exames',
    category: 'saude',
    value: 350,
    date: '2026-02-14',
    recurrence: 'unico',
    notes: 'Check-up anual — clínica particular',
    createdAt: '2026-02-14T00:00:00.000Z',
  },
  {
    id: 'pe-012',
    title: 'Fatura Cartão Inter — Janeiro',
    category: 'cartao_credito',
    value: 1850,
    date: '2026-02-10',
    recurrence: 'fixo_mensal',
    notes: 'Supermercado + combustível + farmácia',
    nextDueDate: '2026-03-10',
    createdAt: '2025-10-01T00:00:00.000Z',
  },
  {
    id: 'pe-013',
    title: 'Internet Fibra Vivo (1Gbps)',
    category: 'gastos_mensais_fixos',
    value: 150,
    date: '2026-03-15',
    recurrence: 'fixo_mensal',
    notes: 'Plano Vivo Fibra Turbo — sem franquia',
    nextDueDate: '2026-04-15',
    createdAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 'pe-014',
    title: 'Dívida Emprestada ao Irmão',
    category: 'dividas_pessoais',
    value: 500,
    date: '2026-01-10',
    recurrence: 'fixo_mensal',
    notes: 'Empréstimo de R$3.000 — recebendo R$500/mês',
    totalDebt: 3000,
    installmentValue: 500,
    totalInstallments: 6,
    paidInstallments: 2,
    nextDueDate: '2026-02-10',
    createdAt: '2025-12-10T00:00:00.000Z',
  },
  {
    id: 'pe-015',
    title: 'Curso de Inglês (CNA Online)',
    category: 'outros',
    value: 380,
    date: '2026-03-05',
    recurrence: 'fixo_mensal',
    notes: 'Plano avançado + conversação com nativo',
    nextDueDate: '2026-04-05',
    createdAt: '2025-09-05T00:00:00.000Z',
  },
  {
    id: 'pe-016',
    title: 'Presente Aniversário (Mãe)',
    category: 'lazer_entretenimento',
    value: 250,
    date: '2025-12-18',
    recurrence: 'unico',
    notes: 'Bolsa + jantar em família',
    createdAt: '2025-12-18T00:00:00.000Z',
  },
  {
    id: 'pe-017',
    title: 'Combustível (Gasolina)',
    category: 'gastos_mensais_fixos',
    value: 420,
    date: '2026-03-01',
    recurrence: 'fixo_mensal',
    notes: 'Média 2 abastecimentos/semana',
    nextDueDate: '2026-04-01',
    createdAt: '2025-10-01T00:00:00.000Z',
  },
]

// ─── Mock Tasks ────────────────────────────────────────────────────────

export const MOCK_TASKS: Task[] = [
  {
    id: 'tk-001',
    title: 'Criar campanha Black Friday 2026',
    description: 'Planejar e executar campanha completa de Black Friday — landing page, anúncios, e-mails e posts em redes sociais.',
    status: 'em_progresso',
    priority: 'alta',
    dueDate: '2026-11-20',
    recurrence: 'unica',
    tags: [
      { id: 'tag-mkt', label: 'Marketing', color: '#F59E0B' },
      { id: 'tag-bf', label: 'Black Friday', color: '#FF1744' },
    ],
    subtasks: [
      { id: 'st-001a', title: 'Definir ofertas e descontos', completed: true },
      { id: 'st-001b', title: 'Criar landing page', completed: false },
      { id: 'st-001c', title: 'Configurar campanhas no Google Ads', completed: false },
      { id: 'st-001d', title: 'Agendar e-mails automáticos', completed: false },
    ],
    createdAt: '2026-03-01T09:00:00.000Z',
    assignee: 'Carlos Mendes',
  },
  {
    id: 'tk-002',
    title: 'Revisar relatório financeiro — Fevereiro/26',
    description: 'Consolidar DRE de fevereiro, conferir lançamentos e preparar apresentação para sócios.',
    status: 'revisao',
    priority: 'urgente',
    dueDate: '2026-03-10',
    recurrence: 'mensal',
    tags: [
      { id: 'tag-fin', label: 'Financeiro', color: '#6366F1' },
      { id: 'tag-rel', label: 'Relatório', color: '#8B5CF6' },
    ],
    subtasks: [
      { id: 'st-002a', title: 'Fechar lançamentos de fevereiro', completed: true },
      { id: 'st-002b', title: 'Calcular margens e KPIs', completed: true },
      { id: 'st-002c', title: 'Montar apresentação no Canva', completed: false },
    ],
    createdAt: '2026-03-01T08:00:00.000Z',
    assignee: 'Ana Lima',
  },
  {
    id: 'tk-003',
    title: 'Implementar novo checkout (PIX + Parcelado)',
    description: 'Integrar checkout com gateway de pagamento Pagar.me — suporte a PIX, boleto e crédito parcelado.',
    status: 'em_progresso',
    priority: 'urgente',
    dueDate: '2026-03-20',
    recurrence: 'unica',
    tags: [
      { id: 'tag-dev', label: 'Desenvolvimento', color: '#06B6D4' },
      { id: 'tag-pag', label: 'Pagamentos', color: '#10B981' },
    ],
    subtasks: [
      { id: 'st-003a', title: 'Integrar API Pagar.me', completed: true },
      { id: 'st-003b', title: 'Implementar fluxo PIX', completed: true },
      { id: 'st-003c', title: 'Implementar parcelamento no crédito', completed: false },
      { id: 'st-003d', title: 'Testes end-to-end (Cypress)', completed: false },
      { id: 'st-003e', title: 'Deploy em produção', completed: false },
    ],
    createdAt: '2026-02-15T10:00:00.000Z',
    assignee: 'Rafael Souza',
  },
  {
    id: 'tk-004',
    title: 'Onboarding de novos colaboradores (março)',
    description: 'Organizar processo de integração para 2 novos desenvolvedores que iniciam em março.',
    status: 'a_fazer',
    priority: 'media',
    dueDate: '2026-03-17',
    recurrence: 'unica',
    tags: [
      { id: 'tag-rh', label: 'RH', color: '#F97316' },
      { id: 'tag-ops', label: 'Operações', color: '#8B5CF6' },
    ],
    subtasks: [
      { id: 'st-004a', title: 'Preparar handbook da empresa', completed: false },
      { id: 'st-004b', title: 'Configurar acessos e ferramentas', completed: false },
      { id: 'st-004c', title: 'Agendar reunião de alinhamento', completed: false },
    ],
    createdAt: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'tk-005',
    title: 'Migrar banco de dados para PostgreSQL 17',
    description: 'Atualizar instância RDS de PostgreSQL 14 para 17 — testar em staging antes de produção.',
    status: 'backlog',
    priority: 'media',
    dueDate: '2026-04-15',
    recurrence: 'unica',
    tags: [
      { id: 'tag-infra', label: 'Infraestrutura', color: '#F97316' },
      { id: 'tag-db', label: 'Banco de Dados', color: '#06B6D4' },
    ],
    subtasks: [
      { id: 'st-005a', title: 'Testar migrations no ambiente local', completed: false },
      { id: 'st-005b', title: 'Migrar staging e validar', completed: false },
      { id: 'st-005c', title: 'Janela de manutenção em produção', completed: false },
    ],
    createdAt: '2026-02-20T14:00:00.000Z',
    assignee: 'Rafael Souza',
  },
  {
    id: 'tk-006',
    title: 'Redesign da tela de Dashboard',
    description: 'Atualizar layout do dashboard principal com novos componentes de gráfico e melhor visualização de KPIs.',
    status: 'concluido',
    priority: 'alta',
    dueDate: '2026-02-28',
    recurrence: 'unica',
    tags: [
      { id: 'tag-design', label: 'Design', color: '#8B5CF6' },
      { id: 'tag-ux', label: 'UX', color: '#6366F1' },
    ],
    subtasks: [
      { id: 'st-006a', title: 'Wireframes no Figma', completed: true },
      { id: 'st-006b', title: 'Aprovação com stakeholders', completed: true },
      { id: 'st-006c', title: 'Implementação no React', completed: true },
      { id: 'st-006d', title: 'QA e testes de usabilidade', completed: true },
    ],
    createdAt: '2026-01-15T10:00:00.000Z',
    assignee: 'Juliana Costa',
  },
  {
    id: 'tk-007',
    title: 'Escrever artigos para blog (SEO)',
    description: '3 artigos focados em palavras-chave de alta intenção para aumentar tráfego orgânico.',
    status: 'a_fazer',
    priority: 'baixa',
    dueDate: '2026-03-31',
    recurrence: 'mensal',
    tags: [
      { id: 'tag-cont', label: 'Conteúdo', color: '#F59E0B' },
      { id: 'tag-seo', label: 'SEO', color: '#10B981' },
    ],
    subtasks: [
      { id: 'st-007a', title: 'Pesquisa de palavras-chave (Ahrefs)', completed: false },
      { id: 'st-007b', title: 'Escrever artigo 1 — "Como controlar finanças PJ"', completed: false },
      { id: 'st-007c', title: 'Escrever artigo 2 — "DRE para pequenas empresas"', completed: false },
    ],
    createdAt: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'tk-008',
    title: 'Auditar contratos de fornecedores',
    description: 'Revisar todos os contratos de SaaS e fornecedores para identificar oportunidades de economia.',
    status: 'backlog',
    priority: 'media',
    dueDate: '2026-04-01',
    recurrence: 'fixo_anual' as TaskRecurrence,
    tags: [
      { id: 'tag-fin2', label: 'Financeiro', color: '#6366F1' },
      { id: 'tag-ops2', label: 'Operações', color: '#F97316' },
    ],
    subtasks: [
      { id: 'st-008a', title: 'Listar todos os contratos ativos', completed: false },
      { id: 'st-008b', title: 'Verificar vigência e valores', completed: false },
      { id: 'st-008c', title: 'Negociar descontos com fornecedores chave', completed: false },
    ],
    createdAt: '2026-02-10T09:00:00.000Z',
    assignee: 'Ana Lima',
  },
  {
    id: 'tk-009',
    title: 'Configurar alertas de estoque crítico',
    description: 'Implementar notificações automáticas via e-mail e Slack quando produtos atingirem estoque mínimo.',
    status: 'concluido',
    priority: 'alta',
    dueDate: '2026-02-15',
    recurrence: 'unica',
    tags: [
      { id: 'tag-dev2', label: 'Desenvolvimento', color: '#06B6D4' },
      { id: 'tag-auto', label: 'Automação', color: '#10B981' },
    ],
    subtasks: [
      { id: 'st-009a', title: 'Definir regras de alerta', completed: true },
      { id: 'st-009b', title: 'Criar webhook para Slack', completed: true },
      { id: 'st-009c', title: 'Configurar template de e-mail', completed: true },
    ],
    createdAt: '2026-01-20T11:00:00.000Z',
    assignee: 'Rafael Souza',
  },
  {
    id: 'tk-010',
    title: 'Planejar Q2 2026 — OKRs e Metas',
    description: 'Definir OKRs do segundo trimestre de 2026 com toda a equipe de liderança.',
    status: 'a_fazer',
    priority: 'urgente',
    dueDate: '2026-03-25',
    recurrence: 'unica',
    tags: [
      { id: 'tag-est', label: 'Estratégia', color: '#8B5CF6' },
      { id: 'tag-okr', label: 'OKRs', color: '#6366F1' },
    ],
    subtasks: [
      { id: 'st-010a', title: 'Revisar OKRs do Q1', completed: false },
      { id: 'st-010b', title: 'Workshop com time de liderança', completed: false },
      { id: 'st-010c', title: 'Documentar e comunicar objetivos', completed: false },
    ],
    createdAt: '2026-03-05T09:00:00.000Z',
    assignee: 'Carlos Mendes',
  },
  {
    id: 'tk-011',
    title: 'Implementar autenticação 2FA',
    description: 'Adicionar suporte a autenticação de dois fatores (TOTP + SMS) para aumentar segurança da plataforma.',
    status: 'revisao',
    priority: 'alta',
    dueDate: '2026-03-15',
    recurrence: 'unica',
    tags: [
      { id: 'tag-seg', label: 'Segurança', color: '#FF1744' },
      { id: 'tag-dev3', label: 'Desenvolvimento', color: '#06B6D4' },
    ],
    subtasks: [
      { id: 'st-011a', title: 'Integrar biblioteca speakeasy (TOTP)', completed: true },
      { id: 'st-011b', title: 'UI de configuração no perfil', completed: true },
      { id: 'st-011c', title: 'Integrar SMS via Twilio', completed: true },
      { id: 'st-011d', title: 'Code review e testes de segurança', completed: false },
    ],
    createdAt: '2026-02-25T10:00:00.000Z',
    assignee: 'Rafael Souza',
  },
  {
    id: 'tk-012',
    title: 'Pesquisa NPS com clientes ativos',
    description: 'Enviar pesquisa de satisfação NPS para toda a base de clientes pagantes e analisar resultados.',
    status: 'backlog',
    priority: 'media',
    dueDate: '2026-04-10',
    recurrence: 'mensal',
    tags: [
      { id: 'tag-cs', label: 'Customer Success', color: '#10B981' },
      { id: 'tag-nps', label: 'NPS', color: '#06B6D4' },
    ],
    subtasks: [
      { id: 'st-012a', title: 'Criar formulário no Typeform', completed: false },
      { id: 'st-012b', title: 'Segmentar lista de clientes', completed: false },
      { id: 'st-012c', title: 'Disparar e-mail de pesquisa', completed: false },
      { id: 'st-012d', title: 'Analisar respostas e gerar relatório', completed: false },
    ],
    createdAt: '2026-03-08T09:00:00.000Z',
    assignee: 'Ana Lima',
  },
]

// ─── Monthly Summary Data (last 12 months) ────────────────────────────

export const MONTHLY_DATA: MonthlyData[] = [
  { month: 'Abr/25', receita: 45000, gastos_empresa: 18500, gastos_pessoais: 8200 },
  { month: 'Mai/25', receita: 52000, gastos_empresa: 21000, gastos_pessoais: 7800 },
  { month: 'Jun/25', receita: 48500, gastos_empresa: 19800, gastos_pessoais: 8500 },
  { month: 'Jul/25', receita: 55000, gastos_empresa: 22500, gastos_pessoais: 9100 },
  { month: 'Ago/25', receita: 61000, gastos_empresa: 24000, gastos_pessoais: 8700 },
  { month: 'Set/25', receita: 58500, gastos_empresa: 23200, gastos_pessoais: 9300 },
  { month: 'Out/25', receita: 63000, gastos_empresa: 25800, gastos_pessoais: 10200 },
  { month: 'Nov/25', receita: 71500, gastos_empresa: 28500, gastos_pessoais: 11500 },
  { month: 'Dez/25', receita: 89000, gastos_empresa: 32000, gastos_pessoais: 14800 },
  { month: 'Jan/26', receita: 54000, gastos_empresa: 26500, gastos_pessoais: 9800 },
  { month: 'Fev/26', receita: 62000, gastos_empresa: 27800, gastos_pessoais: 10500 },
  { month: 'Mar/26', receita: 68500, gastos_empresa: 29200, gastos_pessoais: 11200 },
]

// ─── Computed Helpers ─────────────────────────────────────────────────

/**
 * Returns total company expenses for a given month label.
 */
export function getMonthlyCompanyTotal(month: string): number {
  return MONTHLY_DATA.find(d => d.month === month)?.gastos_empresa ?? 0
}

/**
 * Returns total personal expenses for a given month label.
 */
export function getMonthlyPersonalTotal(month: string): number {
  return MONTHLY_DATA.find(d => d.month === month)?.gastos_pessoais ?? 0
}

/**
 * Returns the sum of all company expense values.
 */
export function getTotalCompanyExpenses(): number {
  return MOCK_COMPANY_EXPENSES.reduce((acc, e) => acc + e.value, 0)
}

/**
 * Returns the sum of all personal expense values.
 */
export function getTotalPersonalExpenses(): number {
  return MOCK_PERSONAL_EXPENSES.reduce((acc, e) => acc + e.value, 0)
}

/**
 * Returns company expenses grouped by category with totals.
 */
export function getCompanyExpensesByCategory(): Record<CompanyCategory, number> {
  const result = {} as Record<CompanyCategory, number>
  for (const expense of MOCK_COMPANY_EXPENSES) {
    result[expense.category] = (result[expense.category] ?? 0) + expense.value
  }
  return result
}

/**
 * Returns personal expenses grouped by category with totals.
 */
export function getPersonalExpensesByCategory(): Record<PersonalCategory, number> {
  const result = {} as Record<PersonalCategory, number>
  for (const expense of MOCK_PERSONAL_EXPENSES) {
    result[expense.category] = (result[expense.category] ?? 0) + expense.value
  }
  return result
}

/**
 * Returns task counts by status.
 */
export function getTaskCountsByStatus() {
  return MOCK_TASKS.reduce(
    (acc, task) => {
      acc[task.status] = (acc[task.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
}
