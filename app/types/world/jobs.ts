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

export type RecruitWorkMode = 'Onsite' | 'Remote' | 'Hybrid'
export type RecruitContractType = 'CDI' | 'CDD' | 'Freelance' | 'Internship'
export type RecruitExperienceLevel = 'Junior' | 'Mid' | 'Senior' | 'Lead'

export interface RecruitCompany {
  name: string
  logo: string
  sector: string
  size: string
}

export interface RecruitSalary {
  min: number
  max: number
  currency: string
  period: string
}

export interface RecruitJob {
  id: string
  slug: string
  title: string
  company: RecruitCompany
  location: string
  contractType: RecruitContractType
  workMode: RecruitWorkMode
  schedule: string
  experienceLevel: RecruitExperienceLevel
  yearsExperienceMin: number
  yearsExperienceMax: number
  salary: RecruitSalary
  postedAtLabel: string
  summary: string
  matchScore: number
  badges: string[]
  tags: string[]
  missionTitle?: string
  missionDescription?: string
  responsibilities?: string[]
  profile?: string[]
  benefits?: string[]
}

export interface RecruitJobsPagination {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export interface RecruitJobsListResponse {
  items: RecruitJob[]
  pagination: RecruitJobsPagination
}

export interface RecruitJobDetailResponse {
  job: RecruitJob
  similarJobs: RecruitJob[]
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
