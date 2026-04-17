import {
  cachedBasketballApiGet,
  getRequiredBasketballId,
  mapBasketballTeamResponse,
} from '../../../utils/basketballApi'
import type { BasketballTeamApiResponse } from '~~/server/types/api/basketball'
import type { ApiSportsBasketballTeamItem } from '~~/server/types/api/basketball/external'

export default defineEventHandler(
  async (event): Promise<BasketballTeamApiResponse> => {
    const team = getRequiredBasketballId(event, 'team')

    const payload = await cachedBasketballApiGet<ApiSportsBasketballTeamItem>(
      event,
      '/teams',
      { id: team },
      { cacheProfile: 'reference', cacheKeySuffix: 'reference-team' },
    )

    return mapBasketballTeamResponse(payload)
  },
)
