import type {
  CrmAccount,
  CrmActivity,
  CrmAnalytics,
  CrmContact,
  CrmLead,
  CrmNote,
  CrmOpportunity,
  CrmOpportunityDetail,
  CrmPipelineColumn,
  CrmPipelineKpis,
  CrmPipelineStage,
} from '../../app/types/crm'
import type {
  CrmOverviewApiResponse,
  CrmOverviewQuery,
  CrmPipelineApiResponse,
} from '../types/api/crm'

interface CrmPipelineStore {
  columns: CrmPipelineColumn[]
  leads: CrmLead[]
  accounts: CrmAccount[]
  contacts: CrmContact[]
  opportunities: CrmOpportunity[]
  activities: CrmActivity[]
  notes: CrmNote[]
  updatedAt: string
}

const CRM_PIPELINE_COLUMNS: CrmPipelineColumn[] = [
  { stage: 'lead', title: 'Lead' },
  { stage: 'qualified', title: 'Qualified' },
  { stage: 'proposal', title: 'Proposal' },
  { stage: 'negotiation', title: 'Negotiation' },
  { stage: 'closed', title: 'Closed' },
]

const INITIAL_LEADS: CrmLead[] = [
  {
    id: 'LD-001',
    fullName: 'Mia Thompson',
    email: 'mia@neon.io',
    source: 'Inbound demo',
    owner: 'A. Martin',
    score: 86,
    status: 'qualified',
    accountId: 'ACC-001',
    createdAt: '2026-01-15',
  },
  {
    id: 'LD-002',
    fullName: 'Lucas Diaz',
    email: 'lucas@atlas.com',
    source: 'Partner referral',
    owner: 'L. Diaz',
    score: 74,
    status: 'working',
    accountId: 'ACC-002',
    createdAt: '2026-02-03',
  },
  {
    id: 'LD-003',
    fullName: 'Sofia Ahmed',
    email: 'sofia@blueharbor.com',
    source: 'Event',
    owner: 'S. Ahmed',
    score: 51,
    status: 'working',
    createdAt: '2026-03-01',
  },
]

const INITIAL_ACCOUNTS: CrmAccount[] = [
  {
    id: 'ACC-001',
    name: 'Neon Replatform',
    industry: 'SaaS',
    owner: 'A. Martin',
    website: 'https://neon.example.com',
    tier: 'enterprise',
    createdAt: '2025-12-02',
  },
  {
    id: 'ACC-002',
    name: 'Atlas Dynamics',
    industry: 'Manufacturing',
    owner: 'N. Park',
    website: 'https://atlas.example.com',
    tier: 'mid-market',
    createdAt: '2025-10-21',
  },
  {
    id: 'ACC-003',
    name: 'Blue Harbor',
    industry: 'Logistics',
    owner: 'M. Costa',
    website: 'https://blueharbor.example.com',
    tier: 'smb',
    createdAt: '2026-01-14',
  },
]

const INITIAL_CONTACTS: CrmContact[] = [
  {
    id: 'CT-001',
    accountId: 'ACC-001',
    fullName: 'Emma Roy',
    title: 'VP Operations',
    email: 'emma@neon.io',
    phone: '+1-212-555-0101',
    isPrimary: true,
  },
  {
    id: 'CT-002',
    accountId: 'ACC-002',
    fullName: 'Noah Park',
    title: 'Head of Revenue',
    email: 'noah@atlas.com',
    phone: '+1-415-555-0132',
    isPrimary: true,
  },
  {
    id: 'CT-003',
    accountId: 'ACC-003',
    fullName: 'Marta Costa',
    title: 'CFO',
    email: 'marta@blueharbor.com',
    phone: '+1-305-555-0103',
    isPrimary: true,
  },
]

const INITIAL_OPPORTUNITIES: CrmOpportunity[] = [
  {
    id: 'OP-001',
    accountId: 'ACC-001',
    leadId: 'LD-001',
    name: 'Neon Enterprise Rollout',
    owner: 'A. Martin',
    amount: 84000,
    probability: 25,
    stage: 'lead',
    expectedCloseDate: '2026-06-10',
    createdAt: '2026-03-10',
    closedAt: null,
    outcome: null,
  },
  {
    id: 'OP-002',
    accountId: 'ACC-002',
    leadId: 'LD-002',
    name: 'Atlas Expansion',
    owner: 'L. Diaz',
    amount: 46500,
    probability: 55,
    stage: 'qualified',
    expectedCloseDate: '2026-05-28',
    createdAt: '2026-02-17',
    closedAt: null,
    outcome: null,
  },
  {
    id: 'OP-003',
    accountId: 'ACC-003',
    name: 'Blue Harbor Renewal',
    owner: 'M. Costa',
    amount: 39000,
    probability: 100,
    stage: 'closed',
    expectedCloseDate: '2026-03-25',
    createdAt: '2025-12-16',
    closedAt: '2026-03-21',
    outcome: 'won',
  },
  {
    id: 'OP-004',
    accountId: 'ACC-002',
    name: 'Kite Labs Upgrade',
    owner: 'R. Silva',
    amount: 18500,
    probability: 0,
    stage: 'closed',
    expectedCloseDate: '2026-03-18',
    createdAt: '2026-01-11',
    closedAt: '2026-03-20',
    outcome: 'lost',
  },
  {
    id: 'OP-005',
    accountId: 'ACC-001',
    name: 'Partner Success',
    owner: 'S. Ahmed',
    amount: 22700,
    probability: 70,
    stage: 'proposal',
    expectedCloseDate: '2026-05-05',
    createdAt: '2026-01-22',
    closedAt: null,
    outcome: null,
  },
]

const INITIAL_ACTIVITIES: CrmActivity[] = [
  {
    id: 'ACT-001',
    opportunityId: 'OP-001',
    type: 'call',
    subject: 'Discovery call with Ops',
    dueAt: '2026-04-06T10:00:00Z',
    completedAt: '2026-04-06T10:45:00Z',
    owner: 'A. Martin',
    direction: 'outbound',
  },
  {
    id: 'ACT-002',
    opportunityId: 'OP-002',
    type: 'email',
    subject: 'Security questionnaire follow-up',
    dueAt: '2026-04-09T14:00:00Z',
    completedAt: null,
    owner: 'L. Diaz',
    direction: 'outbound',
  },
  {
    id: 'ACT-003',
    opportunityId: 'OP-002',
    type: 'task',
    subject: 'Prepare commercial proposal',
    dueAt: '2026-04-17T17:00:00Z',
    completedAt: null,
    owner: 'L. Diaz',
  },
]

const INITIAL_NOTES: CrmNote[] = [
  {
    id: 'NOTE-001',
    opportunityId: 'OP-001',
    author: 'A. Martin',
    body: 'Customer requests phased deployment and premium support.',
    createdAt: '2026-04-06T11:15:00Z',
    attachments: [
      {
        id: 'ATT-001',
        noteId: 'NOTE-001',
        fileName: 'requirements-v3.pdf',
        url: '/mock/crm/requirements-v3.pdf',
        mimeType: 'application/pdf',
        sizeKb: 324,
        uploadedAt: '2026-04-06T11:14:00Z',
      },
    ],
  },
  {
    id: 'NOTE-002',
    opportunityId: 'OP-002',
    author: 'L. Diaz',
    body: 'Legal team asked for DPA addendum before signature.',
    createdAt: '2026-04-08T09:20:00Z',
    attachments: [],
  },
]

function getStore(): CrmPipelineStore {
  const runtime = globalThis as typeof globalThis & {
    __crmPipelineStore?: CrmPipelineStore
  }

  if (!runtime.__crmPipelineStore) {
    runtime.__crmPipelineStore = {
      columns: CRM_PIPELINE_COLUMNS,
      leads: INITIAL_LEADS.map((entry) => ({ ...entry })),
      accounts: INITIAL_ACCOUNTS.map((entry) => ({ ...entry })),
      contacts: INITIAL_CONTACTS.map((entry) => ({ ...entry })),
      opportunities: INITIAL_OPPORTUNITIES.map((entry) => ({ ...entry })),
      activities: INITIAL_ACTIVITIES.map((entry) => ({ ...entry })),
      notes: INITIAL_NOTES.map((entry) => ({
        ...entry,
        attachments: [...entry.attachments],
      })),
      updatedAt: new Date().toISOString(),
    }
  }

  return runtime.__crmPipelineStore
}

function normalizeProbability(
  stage: CrmPipelineStage,
  probability: number,
  outcome: CrmOpportunity['outcome'],
): number {
  if (stage === 'closed') {
    if (outcome === 'won') return 100
    if (outcome === 'lost') return 0
  }

  return Math.min(100, Math.max(0, Math.round(probability)))
}

function computeKpis(opportunities: CrmOpportunity[]): CrmPipelineKpis {
  const activeDeals = opportunities.filter(
    (deal) => deal.stage !== 'closed',
  ).length
  const weightedForecast = opportunities.reduce(
    (sum, deal) => sum + deal.amount * (deal.probability / 100),
    0,
  )

  const closedDeals = opportunities.filter(
    (deal) => deal.stage === 'closed' && deal.outcome,
  )
  const wonDeals = closedDeals.filter((deal) => deal.outcome === 'won').length
  const winRate = closedDeals.length ? (wonDeals / closedDeals.length) * 100 : 0

  const cycleLengths = closedDeals
    .filter((deal) => deal.closedAt)
    .map((deal) => {
      const startedAt = new Date(deal.createdAt).getTime()
      const endedAt = new Date(deal.closedAt as string).getTime()

      return Math.max(
        0,
        Math.round((endedAt - startedAt) / (1000 * 60 * 60 * 24)),
      )
    })

  const averageCycleDays = cycleLengths.length
    ? cycleLengths.reduce((total, cycleDay) => total + cycleDay, 0) /
      cycleLengths.length
    : 0

  return {
    activeDeals,
    weightedForecast,
    winRate,
    averageCycleDays,
  }
}

function computeAnalytics(
  leads: CrmLead[],
  opportunities: CrmOpportunity[],
): CrmAnalytics {
  const qualifiedLeadCount = leads.filter(
    (lead) => lead.status === 'qualified',
  ).length
  const conversionRate = leads.length
    ? (qualifiedLeadCount / leads.length) * 100
    : 0

  const closed = opportunities.filter(
    (entry) => entry.stage === 'closed' && entry.outcome,
  )
  const wins = closed.filter((entry) => entry.outcome === 'won').length
  const losses = closed.filter((entry) => entry.outcome === 'lost').length

  const kpis = computeKpis(opportunities)

  const openPipelineValue = opportunities
    .filter((entry) => entry.stage !== 'closed')
    .reduce((sum, entry) => sum + entry.amount, 0)

  return {
    conversionRate,
    winRate: closed.length ? (wins / closed.length) * 100 : 0,
    lossRate: closed.length ? (losses / closed.length) * 100 : 0,
    averageCycleDays: kpis.averageCycleDays,
    weightedForecast: kpis.weightedForecast,
    openPipelineValue,
  }
}

function normalizeDate(date: string) {
  const timestamp = new Date(date).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function filterOpportunities(
  opportunities: CrmOpportunity[],
  query: CrmOverviewQuery = {},
) {
  const search = String(query.search ?? '')
    .trim()
    .toLowerCase()
  const owner = String(query.owner ?? '')
    .trim()
    .toLowerCase()
  const stage = query.stage && query.stage !== 'all' ? query.stage : undefined
  const industry = String(query.industry ?? '')
    .trim()
    .toLowerCase()
  const minAmount = Number(query.minAmount)
  const maxAmount = Number(query.maxAmount)
  const fromDate = query.fromExpectedCloseDate
    ? normalizeDate(query.fromExpectedCloseDate)
    : 0
  const toDate = query.toExpectedCloseDate
    ? normalizeDate(query.toExpectedCloseDate)
    : 0

  const store = getStore()

  return opportunities.filter((opportunity) => {
    const account = store.accounts.find(
      (item) => item.id === opportunity.accountId,
    )

    const matchesSearch =
      search.length === 0 ||
      opportunity.id.toLowerCase().includes(search) ||
      opportunity.name.toLowerCase().includes(search)
    const matchesOwner =
      owner.length === 0 || opportunity.owner.toLowerCase().includes(owner)
    const matchesStage = !stage || opportunity.stage === stage
    const matchesIndustry =
      industry.length === 0 ||
      !!account?.industry.toLowerCase().includes(industry)
    const matchesMinAmount =
      Number.isNaN(minAmount) || opportunity.amount >= minAmount
    const matchesMaxAmount =
      Number.isNaN(maxAmount) || opportunity.amount <= maxAmount

    const closeDate = normalizeDate(opportunity.expectedCloseDate)
    const matchesFromDate = !fromDate || closeDate >= fromDate
    const matchesToDate = !toDate || closeDate <= toDate

    return (
      matchesSearch &&
      matchesOwner &&
      matchesStage &&
      matchesIndustry &&
      matchesMinAmount &&
      matchesMaxAmount &&
      matchesFromDate &&
      matchesToDate
    )
  })
}

export function getCrmPipelineSnapshot(): CrmPipelineApiResponse {
  const store = getStore()
  const kpis = computeKpis(store.opportunities)

  return {
    columns: store.columns,
    opportunities: store.opportunities,
    deals: store.opportunities,
    kpis,
    analytics: computeAnalytics(store.leads, store.opportunities),
    updatedAt: store.updatedAt,
  }
}

export function getCrmOverview(
  query?: CrmOverviewQuery,
): CrmOverviewApiResponse {
  const store = getStore()
  const filteredOpportunities = filterOpportunities(store.opportunities, query)
  const filteredOpportunityIds = new Set(
    filteredOpportunities.map((item) => item.id),
  )

  const filteredActivities = store.activities.filter((item) =>
    filteredOpportunityIds.has(item.opportunityId),
  )
  const filteredNotes = store.notes.filter((item) =>
    filteredOpportunityIds.has(item.opportunityId),
  )

  return {
    leads: store.leads,
    accounts: store.accounts,
    contacts: store.contacts,
    opportunities: filteredOpportunities,
    activities: filteredActivities,
    notes: filteredNotes,
    pipeline: {
      columns: store.columns,
      opportunities: filteredOpportunities,
    },
    analytics: computeAnalytics(store.leads, filteredOpportunities),
    filtersApplied: {
      ...(query?.search ? { search: String(query.search) } : {}),
      ...(query?.owner ? { owner: String(query.owner) } : {}),
      ...(query?.stage ? { stage: String(query.stage) } : {}),
      ...(query?.industry ? { industry: String(query.industry) } : {}),
      ...(query?.minAmount ? { minAmount: String(query.minAmount) } : {}),
      ...(query?.maxAmount ? { maxAmount: String(query.maxAmount) } : {}),
      ...(query?.fromExpectedCloseDate
        ? { fromExpectedCloseDate: String(query.fromExpectedCloseDate) }
        : {}),
      ...(query?.toExpectedCloseDate
        ? { toExpectedCloseDate: String(query.toExpectedCloseDate) }
        : {}),
    },
    updatedAt: store.updatedAt,
  }
}

export function getCrmOpportunityDetail(
  opportunityId: string,
): CrmOpportunityDetail | null {
  const store = getStore()
  const opportunity = store.opportunities.find(
    (item) => item.id === opportunityId,
  )

  if (!opportunity) {
    return null
  }

  const account =
    store.accounts.find((item) => item.id === opportunity.accountId) ?? null
  const contacts = store.contacts.filter(
    (item) => item.accountId === opportunity.accountId,
  )
  const activities = store.activities.filter(
    (item) => item.opportunityId === opportunityId,
  )
  const notes = store.notes.filter(
    (item) => item.opportunityId === opportunityId,
  )

  const journal = [
    ...activities.map((activity) => ({
      id: `J-${activity.id}`,
      timestamp: activity.completedAt ?? activity.dueAt,
      actor: activity.owner,
      eventType: 'activity' as const,
      message: `[${activity.type.toUpperCase()}] ${activity.subject}`,
    })),
    ...notes.map((note) => ({
      id: `J-${note.id}`,
      timestamp: note.createdAt,
      actor: note.author,
      eventType: 'note' as const,
      message: note.body,
    })),
    {
      id: `J-STAGE-${opportunity.id}`,
      timestamp: opportunity.closedAt ?? opportunity.createdAt,
      actor: opportunity.owner,
      eventType: 'stage_transition' as const,
      message: `Opportunity currently in stage ${opportunity.stage}`,
    },
  ].sort(
    (left, right) =>
      normalizeDate(right.timestamp) - normalizeDate(left.timestamp),
  )

  return {
    opportunity,
    account,
    contacts,
    activities,
    notes,
    journal,
  }
}

export function transitionCrmDeal(
  dealId: string,
  payload: {
    toStage: CrmPipelineStage
    probability: number
    expectedCloseDate: string
    outcome?: CrmOpportunity['outcome']
  },
): CrmOpportunity | null {
  const store = getStore()
  const opportunity = store.opportunities.find((entry) => entry.id === dealId)

  if (!opportunity) {
    return null
  }

  const nextOutcome =
    payload.toStage === 'closed'
      ? (payload.outcome ?? opportunity.outcome ?? 'won')
      : null
  const isClosing = payload.toStage === 'closed'

  opportunity.stage = payload.toStage
  opportunity.outcome = nextOutcome
  opportunity.probability = normalizeProbability(
    payload.toStage,
    payload.probability,
    nextOutcome,
  )
  opportunity.expectedCloseDate = payload.expectedCloseDate
  opportunity.closedAt = isClosing
    ? (opportunity.closedAt ?? new Date().toISOString())
    : null

  store.notes.unshift({
    id: `NOTE-${Math.floor(Math.random() * 900 + 100)}`,
    opportunityId: opportunity.id,
    author: opportunity.owner,
    body: `Stage moved to ${payload.toStage} (${opportunity.probability}% probability).`,
    createdAt: new Date().toISOString(),
    attachments: [],
  })

  store.updatedAt = new Date().toISOString()

  return opportunity
}
