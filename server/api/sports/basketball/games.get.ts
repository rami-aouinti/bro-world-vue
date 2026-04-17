import {
  cachedBasketballApiGet,
  getRequiredBasketballId,
  getRequiredBasketballSeason,
  mapBasketballGamesResponse,
} from '../../../utils/basketballApi'
import type { BasketballGamesApiResponse } from '~~/server/types/api/basketball'
import type { ApiSportsBasketballGameItem } from '~~/server/types/api/basketball/external'

export default defineEventHandler(
  async (event): Promise<BasketballGamesApiResponse> => {
    const league = getRequiredBasketballId(event, 'league')
    const season = getRequiredBasketballSeason(event)

    const payload = await cachedBasketballApiGet<ApiSportsBasketballGameItem>(
      event,
      '/games',
      { league, season },
      { cacheProfile: 'reference', cacheKeySuffix: 'reference-games' },
    )

    return mapBasketballGamesResponse(payload)
  },
)
