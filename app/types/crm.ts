export type CrmPipelineStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won_lost'

export type CrmOutcome = 'won' | 'lost'

export interface CrmDeal {
  id: string
  account: string
  owner: string
  amount: number
  probability: number
  expectedCloseDate: string
  createdAt: string
  stage: CrmPipelineStage
  outcome: CrmOutcome | null
  closedAt: string | null
}

export interface CrmPipelineColumn {
  stage: CrmPipelineStage
  title: string
}

export interface CrmPipelineKpis {
  activeDeals: number
  weightedForecast: number
  winRate: number
  averageCycleDays: number
}

export interface CrmPipelineResponse {
  columns: CrmPipelineColumn[]
  deals: CrmDeal[]
  kpis: CrmPipelineKpis
}

export interface CrmTransitionPayload {
  toStage: CrmPipelineStage
  probability: number
  expectedCloseDate: string
  outcome?: CrmOutcome | null
}
