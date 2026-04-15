import type { LearningProgress, LearningProgressApiResponse, LearningProgressMutationPayload } from '~~/server/types/api/learning'
import { createId, getLearningProgressStorage, saveLearningProgressStorage } from '~~/server/utils/learningStore'

export default defineEventHandler(async (event): Promise<LearningProgressApiResponse> => {
  const courseId = getRouterParam(event, 'courseId')
  const body = await readBody<LearningProgressMutationPayload>(event)

  if (!courseId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing courseId' })
  }

  if (body.action !== 'upsertProgress') {
    throw createError({ statusCode: 400, statusMessage: 'Unsupported action' })
  }

  const progress = await getLearningProgressStorage()
  const now = new Date().toISOString()

  let target = progress.find((entry) => entry.courseId === courseId && entry.learner === body.learner)

  if (!target) {
    const created: LearningProgress = {
      id: createId('prg'),
      courseId,
      learner: body.learner,
      lessonStatuses: {},
      completedAssessments: [],
      updatedAt: now,
    }

    progress.push(created)
    target = created
  }

  if (body.lessonId && body.status) {
    target.lessonStatuses[body.lessonId] = body.status
  }

  if (body.assessmentId && typeof body.assessmentCompleted === 'boolean') {
    if (body.assessmentCompleted) {
      target.completedAssessments = [...new Set([...target.completedAssessments, body.assessmentId])]
    }
    else {
      target.completedAssessments = target.completedAssessments.filter((item) => item !== body.assessmentId)
    }
  }

  target.updatedAt = now

  await saveLearningProgressStorage(progress)

  return {
    items: progress.filter((entry) => entry.courseId === courseId),
  }
})
