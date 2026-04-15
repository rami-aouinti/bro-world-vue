import type {
  JobCandidate,
  JobCandidatesApiResponse,
  JobPipelineStage,
  CandidateTransitionEntry,
} from '~~/server/types/api/jobs'
import { JOB_PIPELINE_STAGES } from '~~/server/types/api/jobs'

const now = () => new Date().toISOString()

const buildScore = (input: JobCandidate['scoreInputs']) => {
  const weighted = (input.skillsMatch * 0.5) + (input.experience * 0.3) + (input.availability * 0.2)
  return {
    skillsMatch: input.skillsMatch,
    experience: input.experience,
    availability: input.availability,
    total: Math.round(weighted),
  }
}

const seedCandidates: JobCandidate[] = [
  {
    id: 'CAND-1001',
    context: 'offers',
    name: 'Nora Dupont',
    offerTitle: 'Senior Frontend Engineer',
    currentStage: 'Screening',
    recruiterNotes: 'Très bonne communication et portfolio solide.',
    panelFeedback: 'Panel positif sur la qualité du code.',
    scoreInputs: { skillsMatch: 88, experience: 81, availability: 72 },
    score: { skillsMatch: 88, experience: 81, availability: 72, total: 0 },
    updatedAt: now(),
    history: [],
  },
  {
    id: 'CAND-1002',
    context: 'applications',
    name: 'Léo Martin',
    offerTitle: 'Product Designer',
    currentStage: 'Interview',
    recruiterNotes: 'Alignement partiel sur les besoins mobile.',
    panelFeedback: 'Excellente présentation de cas UX.',
    scoreInputs: { skillsMatch: 77, experience: 69, availability: 90 },
    score: { skillsMatch: 77, experience: 69, availability: 90, total: 0 },
    updatedAt: now(),
    history: [],
  },
  {
    id: 'CAND-1003',
    context: 'my-offers',
    name: 'Camille Bernard',
    offerTitle: 'Data Analyst',
    currentStage: 'Applied',
    recruiterNotes: 'CV reçu, qualification initiale à faire.',
    panelFeedback: '',
    scoreInputs: { skillsMatch: 64, experience: 58, availability: 95 },
    score: { skillsMatch: 64, experience: 58, availability: 95, total: 0 },
    updatedAt: now(),
    history: [],
  },
]

for (const candidate of seedCandidates) {
  candidate.score = buildScore(candidate.scoreInputs)
}

const candidates = seedCandidates

export const getPipelineStages = () => JOB_PIPELINE_STAGES

export const listCandidatesByContext = (context?: string): JobCandidatesApiResponse => {
  const items = context
    ? candidates.filter(candidate => candidate.context === context)
    : candidates

  return {
    items,
    stages: JOB_PIPELINE_STAGES,
  }
}

type TransitionPayload = {
  candidateId: string
  toStage: JobPipelineStage
  recruiterNotes: string
  panelFeedback: string
  actor: string
}

export const transitionCandidate = (payload: TransitionPayload): JobCandidate => {
  const candidate = candidates.find(item => item.id === payload.candidateId)

  if (!candidate) {
    throw createError({ statusCode: 404, statusMessage: 'Candidate not found' })
  }

  const transition: CandidateTransitionEntry = {
    id: `TR-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
    fromStage: candidate.currentStage,
    toStage: payload.toStage,
    recruiterNotes: payload.recruiterNotes,
    panelFeedback: payload.panelFeedback,
    actor: payload.actor,
    changedAt: now(),
  }

  candidate.currentStage = payload.toStage
  candidate.recruiterNotes = payload.recruiterNotes
  candidate.panelFeedback = payload.panelFeedback
  candidate.updatedAt = transition.changedAt
  candidate.history = [transition, ...candidate.history]
  candidate.score = buildScore(candidate.scoreInputs)

  return candidate
}
