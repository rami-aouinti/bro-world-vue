import { cachedPublicGet } from '../../../utils/publicApi'
import type { QuizCategoriesApiResponse } from '~~/server/types/api/quiz'

export default defineEventHandler(
  async (event): Promise<QuizCategoriesApiResponse> => {
    return cachedPublicGet<QuizCategoriesApiResponse>(
      event,
      '/api/v1/public/quiz/general/categories',
      {
        cacheDomain: 'quiz',
      },
    )
  },
)
