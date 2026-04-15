import type { LearningProgressApiResponse } from '~~/server/types/api/learning'
import { getLearningProgressStorage } from '~~/server/utils/learningStore'

export default defineEventHandler(
  async (event): Promise<LearningProgressApiResponse> => {
    const { courseId } = getRouterParams(event)
    const progress = await getLearningProgressStorage()

    return {
      items: progress.filter((entry) => entry.courseId === courseId),
    }
  },
)
