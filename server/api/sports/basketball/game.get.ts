import {
  cachedBasketballApiGet,
  getRequiredBasketballId,
  mapBasketballGameDetailsResponse,
} from '../../../utils/basketballApi'
import type { BasketballGameDetailsApiResponse } from '~~/server/types/api/basketball'
import type { ApiSportsBasketballGameItem } from '~~/server/types/api/basketball/external'

export default defineEventHandler(
  async (event): Promise<BasketballGameDetailsApiResponse> => {
    const game = getRequiredBasketballId(event, 'game')

    const payload = await cachedBasketballApiGet<ApiSportsBasketballGameItem>(
      event,
      '/games',
      { id: game },
      { cacheProfile: 'reference', cacheKeySuffix: 'reference-game' },
    )

    return mapBasketballGameDetailsResponse(payload)
  },
)
