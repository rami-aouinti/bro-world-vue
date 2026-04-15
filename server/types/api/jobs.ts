export const JOB_PIPELINE_STAGES = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Hired',
  'Rejected',
] as const

export type JobPipelineStage = typeof JOB_PIPELINE_STAGES[number]

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
  offerTitle: string
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
