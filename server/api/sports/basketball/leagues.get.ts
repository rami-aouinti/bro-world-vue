import {
  cachedBasketballApiGet,
  mapBasketballLeaguesResponse,
} from '../../../utils/basketballApi'
import type { BasketballLeaguesApiResponse } from '~~/server/types/api/basketball'
import type { ApiSportsBasketballLeagueItem } from '~~/server/types/api/basketball/external'

export default defineEventHandler(
  async (event): Promise<BasketballLeaguesApiResponse> => {
    const payload = await cachedBasketballApiGet<ApiSportsBasketballLeagueItem>(
      event,
      '/leagues',
      {},
      { cacheProfile: 'reference', cacheKeySuffix: 'reference-leagues' },
    )

    return mapBasketballLeaguesResponse(payload)
  },
)
