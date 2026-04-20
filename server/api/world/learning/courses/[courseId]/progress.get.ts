import type { LearningProgressApiResponse } from '~~/server/types/api/learning'
import { getLearningProgressStorage } from '~~/server/utils/learningStore'
import { getLearningProgressFromSchool } from '~~/server/utils/learningPublicSchool'

export default defineEventHandler(
  async (event): Promise<LearningProgressApiResponse> => {
    const { courseId } = getRouterParams(event)
    const progress = await getLearningProgressFromSchool(event).catch(() =>
      getLearningProgressStorage(),
    )

    return {
      items: progress.filter((entry) => entry.courseId === courseId),
    }
  },
)
