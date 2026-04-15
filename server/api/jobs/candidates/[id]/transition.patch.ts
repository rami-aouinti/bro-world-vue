import { JOB_PIPELINE_STAGES, type JobCandidate, type JobPipelineStage } from '~~/server/types/api/jobs'
import { transitionCandidate } from '~~/server/utils/jobsPipelineStore'

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
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing candidate id' })
  }

  const body = await readBody<TransitionBody>(event)
  const toStage = body.toStage ?? ''

  if (!isPipelineStage(toStage)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid pipeline stage' })
  }

  return transitionCandidate({
    candidateId: id,
    toStage,
    recruiterNotes: body.recruiterNotes?.trim() || '',
    panelFeedback: body.panelFeedback?.trim() || '',
    actor: body.actor?.trim() || 'Recruiter',
  })
})
