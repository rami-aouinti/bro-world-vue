import type { LearningCoursesApiResponse } from '~~/server/types/api/learning'
import { getLearningCoursesStorage } from '~~/server/utils/learningStore'

export default defineEventHandler(
  async (): Promise<LearningCoursesApiResponse> => {
    const items = await getLearningCoursesStorage()

    return { items }
  },
)
