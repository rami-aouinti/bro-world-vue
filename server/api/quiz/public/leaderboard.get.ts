import { cachedPublicGet } from '../../../utils/publicApi'
import type { QuizLeaderboardApiResponse } from '~~/server/types/api/quiz'

export default defineEventHandler(
  async (event): Promise<QuizLeaderboardApiResponse> => {
    return cachedPublicGet<QuizLeaderboardApiResponse>(
      event,
      '/api/v1/public/quiz/general/leaderboard',
      {
        cacheDomain: 'quiz',
      },
    )
  },
)
