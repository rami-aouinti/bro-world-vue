import type { LearningAdminAnalyticsApiResponse } from '~~/server/types/api/learning'
import {
  buildLearningAdminAnalytics,
  getLearningProgressStorage,
} from '~~/server/utils/learningStore'
import { getLearningProgressFromSchool } from '~~/server/utils/learningPublicSchool'

export default defineEventHandler(
  async (event): Promise<LearningAdminAnalyticsApiResponse> => {
    const progress = await getLearningProgressFromSchool(event).catch(() =>
      getLearningProgressStorage(),
    )

    return {
      items: buildLearningAdminAnalytics(progress),
    }
  },
)
