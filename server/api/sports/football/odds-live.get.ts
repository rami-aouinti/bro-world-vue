import {
  cachedFootballApiGet,
  mapOddsResponse,
} from '../../../utils/footballApi'
import type { FootballOddsApiResponse } from '~~/server/types/api/football'
import type { ApiSportsOddsItem } from '~~/server/types/api/football/external'

export default defineEventHandler(
  async (event): Promise<FootballOddsApiResponse> => {
    const payload = await cachedFootballApiGet<ApiSportsOddsItem>(
      event,
      '/odds/live',
      {},
      { cacheProfile: 'live', cacheKeySuffix: 'live-odds-live' },
    )

    return mapOddsResponse(payload)
  },
)
