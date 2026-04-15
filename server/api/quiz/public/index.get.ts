import { cachedPublicGet } from '../../../utils/publicApi'
import type { QuizPublicApiResponse } from '~~/server/types/api/quiz'

export default defineEventHandler(
  async (event): Promise<QuizPublicApiResponse> => {
    const query = getQuery(event)
    const category =
      typeof query.category === 'string' ? query.category : undefined
    const level = typeof query.level === 'string' ? query.level : undefined

    return cachedPublicGet<QuizPublicApiResponse>(
      event,
      '/public/quiz/general',
      {
        query: { category, level },
        cacheDomain: 'quiz',
      },
    )
  },
)
