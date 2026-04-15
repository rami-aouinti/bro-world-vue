import type { LearningAdminAnalyticsApiResponse } from '~~/server/types/api/learning'
import {
  buildLearningAdminAnalytics,
  getLearningProgressStorage,
} from '~~/server/utils/learningStore'

export default defineEventHandler(
  async (): Promise<LearningAdminAnalyticsApiResponse> => {
    const progress = await getLearningProgressStorage()

    return {
      items: buildLearningAdminAnalytics(progress),
    }
  },
)
