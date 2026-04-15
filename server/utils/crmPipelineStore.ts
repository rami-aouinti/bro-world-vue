import type { CrmDeal, CrmPipelineColumn, CrmPipelineKpis, CrmPipelineStage } from '../../app/types/crm'

interface CrmPipelineStore {
  columns: CrmPipelineColumn[]
  deals: CrmDeal[]
  updatedAt: string
}

const CRM_PIPELINE_COLUMNS: CrmPipelineColumn[] = [
  { stage: 'lead', title: 'Lead' },
  { stage: 'qualified', title: 'Qualified' },
  { stage: 'proposal', title: 'Proposal' },
  { stage: 'negotiation', title: 'Negotiation' },
  { stage: 'won_lost', title: 'Won/Lost' },
]

const INITIAL_DEALS: CrmDeal[] = [
  {
    id: 'DL-001',
    account: 'Neon Replatform',
    owner: 'A. Martin',
    amount: 84000,
    probability: 25,
    expectedCloseDate: '2026-06-10',
    createdAt: '2026-03-10',
    stage: 'lead',
    outcome: null,
    closedAt: null,
  },
  {
    id: 'DL-002',
    account: 'Enterprise Onboarding',
    owner: 'L. Diaz',
    amount: 46500,
    probability: 55,
    expectedCloseDate: '2026-05-28',
    createdAt: '2026-02-17',
    stage: 'qualified',
    outcome: null,
    closedAt: null,
  },
  {
    id: 'DL-003',
    account: 'Partner Success',
    owner: 'S. Ahmed',
    amount: 22700,
    probability: 70,
    expectedCloseDate: '2026-05-05',
    createdAt: '2026-01-22',
    stage: 'proposal',
    outcome: null,
    closedAt: null,
  },
  {
    id: 'DL-004',
    account: 'Atlas Dynamics Expansion',
    owner: 'N. Park',
    amount: 130000,
    probability: 80,
    expectedCloseDate: '2026-04-30',
    createdAt: '2026-01-07',
    stage: 'negotiation',
    outcome: null,
    closedAt: null,
  },
  {
    id: 'DL-005',
    account: 'Blue Harbor Renewal',
    owner: 'M. Costa',
    amount: 39000,
    probability: 100,
    expectedCloseDate: '2026-03-25',
    createdAt: '2025-12-16',
    stage: 'won_lost',
    outcome: 'won',
    closedAt: '2026-03-21',
  },
  {
    id: 'DL-006',
    account: 'Kite Labs Upgrade',
    owner: 'R. Silva',
    amount: 18500,
    probability: 0,
    expectedCloseDate: '2026-03-18',
    createdAt: '2026-01-11',
    stage: 'won_lost',
    outcome: 'lost',
    closedAt: '2026-03-20',
  },
]

function getStore(): CrmPipelineStore {
  const runtime = globalThis as typeof globalThis & { __crmPipelineStore?: CrmPipelineStore }

  if (!runtime.__crmPipelineStore) {
    runtime.__crmPipelineStore = {
      columns: CRM_PIPELINE_COLUMNS,
      deals: INITIAL_DEALS.map((deal) => ({ ...deal })),
      updatedAt: new Date().toISOString(),
    }
  }

  return runtime.__crmPipelineStore
}

function normalizeProbability(stage: CrmPipelineStage, probability: number, outcome: CrmDeal['outcome']): number {
  if (stage === 'won_lost') {
    if (outcome === 'won') {
      return 100
    }

    if (outcome === 'lost') {
      return 0
    }
  }

  return Math.min(100, Math.max(0, Math.round(probability)))
}

export function getCrmPipelineSnapshot() {
  const store = getStore()

  return {
    columns: store.columns,
    deals: store.deals,
    kpis: computeKpis(store.deals),
    updatedAt: store.updatedAt,
  }
}

export function transitionCrmDeal(
  dealId: string,
  payload: { toStage: CrmPipelineStage; probability: number; expectedCloseDate: string; outcome?: CrmDeal['outcome'] },
): CrmDeal | null {
  const store = getStore()
  const deal = store.deals.find((entry) => entry.id === dealId)

  if (!deal) {
    return null
  }

  const nextOutcome = payload.toStage === 'won_lost' ? (payload.outcome ?? deal.outcome ?? 'won') : null
  const isClosing = payload.toStage === 'won_lost'

  deal.stage = payload.toStage
  deal.outcome = nextOutcome
  deal.probability = normalizeProbability(payload.toStage, payload.probability, nextOutcome)
  deal.expectedCloseDate = payload.expectedCloseDate
  deal.closedAt = isClosing ? deal.closedAt ?? new Date().toISOString() : null
  store.updatedAt = new Date().toISOString()

  return deal
}

function computeKpis(deals: CrmDeal[]): CrmPipelineKpis {
  const activeDeals = deals.filter((deal) => deal.stage !== 'won_lost').length
  const weightedForecast = deals.reduce((sum, deal) => sum + deal.amount * (deal.probability / 100), 0)

  const closedDeals = deals.filter((deal) => deal.stage === 'won_lost' && deal.outcome)
  const wonDeals = closedDeals.filter((deal) => deal.outcome === 'won').length
  const winRate = closedDeals.length ? (wonDeals / closedDeals.length) * 100 : 0

  const cycleLengths = closedDeals
    .filter((deal) => deal.closedAt)
    .map((deal) => {
      const startedAt = new Date(deal.createdAt).getTime()
      const endedAt = new Date(deal.closedAt as string).getTime()

      return Math.max(0, Math.round((endedAt - startedAt) / (1000 * 60 * 60 * 24)))
    })

  const averageCycleDays = cycleLengths.length
    ? cycleLengths.reduce((total, cycleDay) => total + cycleDay, 0) / cycleLengths.length
    : 0

  return {
    activeDeals,
    weightedForecast,
    winRate,
    averageCycleDays,
  }
}
