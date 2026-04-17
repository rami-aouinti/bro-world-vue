import {
  cachedBasketballApiGet,
  getRequiredBasketballId,
  getRequiredBasketballSeason,
  mapBasketballStandingsResponse,
} from '../../../utils/basketballApi'
import type { BasketballStandingsApiResponse } from '~~/server/types/api/basketball'
import type { ApiSportsBasketballStandingItem } from '~~/server/types/api/basketball/external'

export default defineEventHandler(
  async (event): Promise<BasketballStandingsApiResponse> => {
    const league = getRequiredBasketballId(event, 'league')
    const season = getRequiredBasketballSeason(event)

    const payload =
      await cachedBasketballApiGet<ApiSportsBasketballStandingItem>(
        event,
        '/standings',
        { league, season },
        { cacheProfile: 'reference', cacheKeySuffix: 'reference-standings' },
      )

    return mapBasketballStandingsResponse(payload)
  },
)
