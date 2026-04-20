import type { LearningCoursesApiResponse } from '~~/server/types/api/learning'
import { getLearningCoursesStorage } from '~~/server/utils/learningStore'
import { getLearningCoursesFromSchool } from '~~/server/utils/learningPublicSchool'

export default defineEventHandler(
  async (event): Promise<LearningCoursesApiResponse> => {
    const items = await getLearningCoursesFromSchool(event).catch(() =>
      getLearningCoursesStorage(),
    )

    return { items }
  },
)
