import type {
  LearningProgress,
  LearningProgressApiResponse,
  LearningProgressMutationPayload,
} from '~~/server/types/api/learning'
import {
  createId,
  evaluateProgressRules,
  getLearningCoursesStorage,
  getLearningProgressStorage,
  saveLearningProgressStorage,
} from '~~/server/utils/learningStore'

export default defineEventHandler(
  async (event): Promise<LearningProgressApiResponse> => {
    const courseId = getRouterParam(event, 'courseId')
    const body = await readBody<LearningProgressMutationPayload>(event)

    if (!courseId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing courseId' })
    }

    if (body.action !== 'upsertProgress') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Unsupported action',
      })
    }

    const courses = await getLearningCoursesStorage()
    const course = courses.find((entry) => entry.id === courseId)

    if (!course) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Learning course not found',
      })
    }

    const progress = await getLearningProgressStorage()
    const now = new Date().toISOString()

    let target = progress.find(
      (entry) => entry.courseId === courseId && entry.learner === body.learner,
    )

    if (!target) {
      const created: LearningProgress = {
        id: createId('prg'),
        courseId,
        learner: body.learner,
        cohort: body.cohort?.trim() || 'cohort-alpha',
        lessonStatuses: {},
        completedAssessments: [],
        score: 0,
        timeSpentMinutes: 0,
        attempts: 0,
        currentLevel: 'beginner',
        unlockedLevels: ['beginner'],
        hasDroppedOut: false,
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
        target.completedAssessments = [
          ...new Set([...target.completedAssessments, body.assessmentId]),
        ]
      } else {
        target.completedAssessments = target.completedAssessments.filter(
          (item) => item !== body.assessmentId,
        )
      }
    }

    if (typeof body.score === 'number') {
      target.score = Math.max(0, Math.min(100, body.score))
    }

    if (typeof body.timeSpentMinutes === 'number') {
      target.timeSpentMinutes = Math.max(0, Math.round(body.timeSpentMinutes))
    }

    if (typeof body.attempts === 'number') {
      target.attempts = Math.max(0, Math.round(body.attempts))
    }

    if (body.cohort?.trim()) {
      target.cohort = body.cohort.trim()
    }

    evaluateProgressRules(course, target)
    target.updatedAt = now

    await saveLearningProgressStorage(progress)

    return {
      items: progress.filter((entry) => entry.courseId === courseId),
    }
  },
)
