import type {
  JobCandidatesApiResponse,
  JobPipelineStage,
  JobsAdminDashboardResponse,
  JobsAdminPolicyResponse,
} from '~~/server/types/api/jobs'

export interface WorldPaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface WorldJobsFilters {
  context?: 'offers' | 'applications' | 'my-offers'
  q?: string
  stage?: JobPipelineStage
}

export interface WorldJobsTransitionPayload {
  toStage: JobPipelineStage
  recruiterNotes: string
  panelFeedback: string
  actor: string
}

export type WorldJobsCandidatesListResponse = JobCandidatesApiResponse
export type WorldJobsAdminPolicyDetailResponse = JobsAdminPolicyResponse
export type WorldJobsAdminDashboardDetailResponse = JobsAdminDashboardResponse
