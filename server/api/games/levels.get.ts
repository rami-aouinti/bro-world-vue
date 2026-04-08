import { cachedPublicGet } from '../../utils/publicApi'
import type { GamesLevelsApiResponse } from '~~/server/types/api/games'

export default defineEventHandler(async (event): Promise<GamesLevelsApiResponse> => {
  return cachedPublicGet<GamesLevelsApiResponse>(event, '/game-levels', {
    cacheDomain: 'games',
  })
})
