import { cachedPublicGet } from '../../utils/publicApi'
import type { GamesCatalogApiResponse } from '~~/server/types/api/games'

export default defineEventHandler(
  async (event): Promise<GamesCatalogApiResponse> => {
    return cachedPublicGet<GamesCatalogApiResponse>(
      event,
      '/public/game-catalog',
      {
        cacheDomain: 'games',
      },
    )
  },
)
