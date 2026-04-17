import {
  cachedBasketballApiGet,
  getRequiredBasketballId,
  getRequiredBasketballSeason,
  mapBasketballTeamsResponse,
} from '../../../utils/basketballApi'
import type { BasketballTeamsApiResponse } from '~~/server/types/api/basketball'
import type { ApiSportsBasketballTeamItem } from '~~/server/types/api/basketball/external'

export default defineEventHandler(
  async (event): Promise<BasketballTeamsApiResponse> => {
    const league = getRequiredBasketballId(event, 'league')
    const season = getRequiredBasketballSeason(event)

    const payload = await cachedBasketballApiGet<ApiSportsBasketballTeamItem>(
      event,
      '/teams',
      { league, season },
      { cacheProfile: 'reference', cacheKeySuffix: 'reference-teams' },
    )

    return mapBasketballTeamsResponse(payload)
  },
)
