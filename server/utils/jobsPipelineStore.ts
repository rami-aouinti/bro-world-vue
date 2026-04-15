import type {
  JobCandidate,
  JobCandidatesApiResponse,
  JobAccessRole,
  JobPermissionMatrix,
  JobPipelineStage,
  CandidateTransitionEntry,
} from '~~/server/types/api/jobs'
import { JOB_PIPELINE_STAGES } from '~~/server/types/api/jobs'
import { getJobsPolicy, getResolvedPermissions } from './jobsAdminStore'

const now = () => new Date().toISOString()

const buildScore = (input: JobCandidate['scoreInputs']) => {
  const weighted =
    input.skillsMatch * 0.5 + input.experience * 0.3 + input.availability * 0.2
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
    email: 'nora.dupont@example.com',
    phone: '+33 6 12 34 56 78',
    offerTitle: 'Senior Frontend Engineer',
    source: 'Referral',
    diversityFlags: ['Women in Tech'],
    createdAt: new Date(Date.now() - 22 * 86400000).toISOString(),
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
    email: 'leo.martin@example.com',
    phone: '+33 6 87 65 43 21',
    offerTitle: 'Product Designer',
    source: 'Career site',
    diversityFlags: [],
    createdAt: new Date(Date.now() - 48 * 86400000).toISOString(),
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
    email: 'camille.bernard@example.com',
    phone: '+33 6 99 88 77 66',
    offerTitle: 'Data Analyst',
    source: 'Job board',
    diversityFlags: ['Disability declaration'],
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
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

type CandidateListOptions = {
  role: JobAccessRole
}

const daysBetween = (from: string, to: string): number => {
  const fromTime = new Date(from).getTime()
  const toTime = new Date(to).getTime()
  const duration = Math.max(toTime - fromTime, 0)
  return Math.floor(duration / 86400000)
}

const applyReadRestrictions = (
  candidate: JobCandidate,
  role: JobAccessRole,
  permission: JobPermissionMatrix,
): JobCandidate => {
  const policy = getJobsPolicy()
  const anonymize =
    daysBetween(candidate.updatedAt, now()) >= policy.anonymizeAfterDays
  const shouldMaskPii =
    anonymize || (policy.restrictedAccessEnabled && !permission.canViewPii)
  const shouldMaskDiversity =
    policy.restrictedAccessEnabled && !permission.canViewDiversity

  return {
    ...candidate,
    name: shouldMaskPii ? `Candidate ${candidate.id}` : candidate.name,
    email: shouldMaskPii ? 'hidden@redacted.local' : candidate.email,
    phone: shouldMaskPii ? 'REDACTED' : candidate.phone,
    recruiterNotes: role === 'interviewer' ? '' : candidate.recruiterNotes,
    panelFeedback:
      role === 'interviewer'
        ? candidate.panelFeedback
        : candidate.panelFeedback,
    diversityFlags: shouldMaskDiversity ? [] : candidate.diversityFlags,
  }
}

export const listCandidatesByContext = (
  context: string | undefined,
  options: CandidateListOptions,
): JobCandidatesApiResponse => {
  const permission = getResolvedPermissions(options.role)
  const items = context
    ? candidates.filter((candidate) => candidate.context === context)
    : candidates

  return {
    items: items.map((candidate) =>
      applyReadRestrictions(candidate, options.role, permission),
    ),
    stages: JOB_PIPELINE_STAGES,
  }
}

type TransitionPayload = {
  candidateId: string
  toStage: JobPipelineStage
  recruiterNotes: string
  panelFeedback: string
  actor: string
  role: JobAccessRole
}

export const transitionCandidate = (
  payload: TransitionPayload,
): JobCandidate => {
  const permission = getResolvedPermissions(payload.role)

  if (!permission.canTransitionStage) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Role cannot transition pipeline stages',
    })
  }

  const candidate = candidates.find((item) => item.id === payload.candidateId)

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

  return applyReadRestrictions(candidate, payload.role, permission)
}
