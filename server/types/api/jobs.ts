export const JOB_PIPELINE_STAGES = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Hired',
  'Rejected',
] as const

export type JobPipelineStage = (typeof JOB_PIPELINE_STAGES)[number]

export type CandidateScoreBreakdown = {
  skillsMatch: number
  experience: number
  availability: number
  total: number
}

export type CandidateTransitionEntry = {
  id: string
  fromStage: JobPipelineStage
  toStage: JobPipelineStage
  recruiterNotes: string
  panelFeedback: string
  actor: string
  changedAt: string
}

export type JobCandidate = {
  id: string
  context: 'offers' | 'applications' | 'my-offers'
  name: string
  email: string
  phone: string
  offerTitle: string
  source: 'Referral' | 'Job board' | 'Career site' | 'Agency'
  diversityFlags: string[]
  createdAt: string
  currentStage: JobPipelineStage
  recruiterNotes: string
  panelFeedback: string
  scoreInputs: {
    skillsMatch: number
    experience: number
    availability: number
  }
  score: CandidateScoreBreakdown
  updatedAt: string
  history: CandidateTransitionEntry[]
}

export type JobCandidatesApiResponse = {
  items: JobCandidate[]
  stages: readonly JobPipelineStage[]
}

export const JOB_ACCESS_ROLES = [
  'recruiter',
  'hiring_manager',
  'interviewer',
  'admin',
] as const

export type JobAccessRole = (typeof JOB_ACCESS_ROLES)[number]

export type JobPermissionMatrix = {
  canViewPii: boolean
  canViewCompensation: boolean
  canTransitionStage: boolean
  canEditNotes: boolean
  canViewDiversity: boolean
  canManagePolicy: boolean
}

export type JobsDataRetentionPolicy = {
  retentionDays: number
  anonymizeAfterDays: number
  restrictedAccessEnabled: boolean
  autoDeleteRejectedAfterDays: number
  legalHoldEnabled: boolean
}

export type JobsAdminPolicyResponse = {
  policy: JobsDataRetentionPolicy
  permissions: Record<JobAccessRole, JobPermissionMatrix>
}

export type JobsAdminDashboardResponse = {
  timeToHireDays: {
    average: number
    median: number
    target: number
  }
  candidateSources: Array<{
    source: JobCandidate['source']
    count: number
    ratio: number
  }>
  offerAcceptanceRate: {
    accepted: number
    declined: number
    rate: number
  }
  diversityPipeline: {
    totalCandidates: number
    selfIdentified: number
    ratio: number
  }
}
