import {
  JOB_PIPELINE_STAGES,
  type JobCandidate,
  type JobPipelineStage,
} from '~~/server/types/api/jobs'
import { resolveJobAccessRole } from '~~/server/utils/jobsAdminStore'
import { transitionCandidate } from '~~/server/utils/jobsPipelineStore'
import type { SessionUser } from '~/types/session'

type TransitionBody = {
  toStage?: string
  recruiterNotes?: string
  panelFeedback?: string
  actor?: string
}

const isPipelineStage = (value: string): value is JobPipelineStage => {
  return JOB_PIPELINE_STAGES.includes(value as JobPipelineStage)
}

export default defineEventHandler(async (event): Promise<JobCandidate> => {
  await requireUserSession(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing candidate id',
    })
  }

  const body = await readBody<TransitionBody>(event)
  const toStage = body.toStage ?? ''

  if (!isPipelineStage(toStage)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid pipeline stage',
    })
  }

  const session = await getUserSession(event)
  const user = (session?.user as SessionUser | null) ?? null
  const role = resolveJobAccessRole(user)

  return transitionCandidate({
    candidateId: id,
    toStage,
    recruiterNotes: body.recruiterNotes?.trim() || '',
    panelFeedback: body.panelFeedback?.trim() || '',
    actor: body.actor?.trim() || user?.username || 'Recruiter',
    role,
  })
})
