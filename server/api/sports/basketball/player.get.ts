import {
  cachedBasketballApiGet,
  getOptionalBasketballSeason,
  getRequiredBasketballId,
  mapBasketballPlayerResponse,
} from '../../../utils/basketballApi'
import type { BasketballPlayerApiResponse } from '~~/server/types/api/basketball'
import type { ApiSportsBasketballPlayerItem } from '~~/server/types/api/basketball/external'

export default defineEventHandler(
  async (event): Promise<BasketballPlayerApiResponse> => {
    const player = getRequiredBasketballId(event, 'player')
    const season = getOptionalBasketballSeason(event)

    const payload = await cachedBasketballApiGet<ApiSportsBasketballPlayerItem>(
      event,
      '/players',
      {
        id: player,
        ...(season ? { season } : {}),
      },
      { cacheProfile: 'reference', cacheKeySuffix: 'reference-player' },
    )

    return mapBasketballPlayerResponse(payload)
  },
)
