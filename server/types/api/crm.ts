import type {
  CrmDeal,
  CrmOutcome,
  CrmPipelineColumn,
  CrmPipelineKpis,
  CrmPipelineStage,
} from '../../../app/types/crm'

export interface CrmPipelineApiResponse {
  columns: CrmPipelineColumn[]
  deals: CrmDeal[]
  kpis: CrmPipelineKpis
  updatedAt: string
}

export interface CrmTransitionApiPayload {
  toStage: CrmPipelineStage
  probability: number
  expectedCloseDate: string
  outcome?: CrmOutcome | null
}
