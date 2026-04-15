export type CrmPipelineStage =
  | 'lead'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'closed'

export type CrmOpportunityOutcome = 'won' | 'lost'

export type CrmOutcome = CrmOpportunityOutcome

export interface CrmPipelineKpis {
  activeDeals: number
  weightedForecast: number
  winRate: number
  averageCycleDays: number
}

export type CrmActivityType = 'call' | 'email' | 'task'

export interface CrmLead {
  id: string
  fullName: string
  email: string
  source: string
  owner: string
  score: number
  status: 'new' | 'working' | 'qualified' | 'disqualified'
  accountId?: string
  createdAt: string
}

export interface CrmAccount {
  id: string
  name: string
  industry: string
  owner: string
  website: string
  tier: 'enterprise' | 'mid-market' | 'smb'
  createdAt: string
}

export interface CrmContact {
  id: string
  accountId: string
  fullName: string
  title: string
  email: string
  phone: string
  isPrimary: boolean
}

export interface CrmOpportunity {
  id: string
  accountId: string
  leadId?: string
  name: string
  owner: string
  amount: number
  probability: number
  stage: CrmPipelineStage
  expectedCloseDate: string
  createdAt: string
  closedAt: string | null
  outcome: CrmOpportunityOutcome | null
}

export interface CrmActivity {
  id: string
  opportunityId: string
  type: CrmActivityType
  subject: string
  dueAt: string
  completedAt: string | null
  owner: string
  direction?: 'inbound' | 'outbound'
}

export interface CrmAttachment {
  id: string
  noteId: string
  fileName: string
  url: string
  mimeType: string
  sizeKb: number
  uploadedAt: string
}

export interface CrmNote {
  id: string
  opportunityId: string
  author: string
  body: string
  createdAt: string
  attachments: CrmAttachment[]
}

export interface CrmPipelineColumn {
  stage: CrmPipelineStage
  title: string
}

export interface CrmAnalytics {
  conversionRate: number
  winRate: number
  lossRate: number
  averageCycleDays: number
  weightedForecast: number
  openPipelineValue: number
}

export interface CrmOpportunityActivityJournalEntry {
  id: string
  timestamp: string
  actor: string
  eventType: 'stage_transition' | 'activity' | 'note'
  message: string
}

export interface CrmOpportunityDetail {
  opportunity: CrmOpportunity
  account: CrmAccount | null
  contacts: CrmContact[]
  activities: CrmActivity[]
  notes: CrmNote[]
  journal: CrmOpportunityActivityJournalEntry[]
}

export interface CrmOverviewFilters {
  search?: string
  owner?: string
  stage?: CrmPipelineStage | 'all'
  industry?: string
  minAmount?: number
  maxAmount?: number
  fromExpectedCloseDate?: string
  toExpectedCloseDate?: string
}

export interface CrmOverviewResponse {
  leads: CrmLead[]
  accounts: CrmAccount[]
  contacts: CrmContact[]
  opportunities: CrmOpportunity[]
  activities: CrmActivity[]
  notes: CrmNote[]
  pipeline: {
    columns: CrmPipelineColumn[]
    opportunities: CrmOpportunity[]
  }
  analytics: CrmAnalytics
  filtersApplied: Record<string, string>
  updatedAt: string
}

export interface CrmTransitionPayload {
  toStage: CrmPipelineStage
  probability: number
  expectedCloseDate: string
  outcome?: CrmOpportunityOutcome | null
}
