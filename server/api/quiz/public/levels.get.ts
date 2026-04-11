import { cachedPublicGet } from '../../../utils/publicApi'
import type { QuizLevelsApiResponse } from '~~/server/types/api/quiz'

export default defineEventHandler(async (event): Promise<QuizLevelsApiResponse> => {
  return cachedPublicGet<QuizLevelsApiResponse>(
    event,
    '/public/quiz/general/levels',
    {
      cacheDomain: 'quiz',
    },
  )
})
