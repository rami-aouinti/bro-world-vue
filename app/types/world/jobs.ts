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

export type RecruitMyJobsResponse = {
  createdJobs: Array<{
    id: string
    slug: string
    title: string
    company: string
    location: string
    contractType: string
    workMode: string
    schedule: string
    createdAt?: string
    owner: boolean
    apply: boolean
  }>
  appliedJobs: Array<{
    applicationId: string
    status: string
    appliedAt: string
    job: {
      id: string
      slug: string
      title: string
      company: string
      location: string
      contractType: string
      workMode: string
      schedule: string
      owner: boolean
      apply: boolean
    }
  }>
}

export type RecruitResumeSection = {
  id?: string
  title: string
  description?: string
  startDate?: string | null
  endDate?: string | null
  company?: string | null
  school?: string | null
  location?: string | null
  level?: string | null
  flag?: string | null
  countryCode?: string | null
  attachments?: string[]
  home_page?: string | null
}

export type RecruitResumeInformation = {
  fullName?: string | null
  email?: string | null
  phone?: string | null
  homepage?: string | null
  repo_profile?: string | null
  address?: string | null
}

export type RecruitResume = {
  id: string
  documentUrl: string | null
  resumeInformation?: RecruitResumeInformation | null
  experiences: RecruitResumeSection[]
  educations: RecruitResumeSection[]
  skills: RecruitResumeSection[]
  languages: RecruitResumeSection[]
  certifications: RecruitResumeSection[]
  projects: RecruitResumeSection[]
  references: RecruitResumeSection[]
  hobbies: RecruitResumeSection[]
}

export type RecruitApplicant = {
  id: string
  coverLetter: string
  createdAt?: {
    date: string
    timezone_type: number
    timezone: string
  }
  updatedAt?: {
    date: string
    timezone_type: number
    timezone: string
  }
}

export type RecruitApplicationStatus =
  | 'WAITING'
  | 'SCREENING'
  | 'INTERVIEW_PLANNED'
  | 'INTERVIEW_DONE'
  | 'OFFER_SENT'
  | 'HIRED'
  | 'REJECTED'

export type RecruitApplicationSummary = {
  id: string
  status: RecruitApplicationStatus
}
