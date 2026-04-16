import {
  cachedFootballApiGet,
  mapLeaguesResponse,
} from '../../../utils/footballApi'
import type { ApiSportsLeagueItem } from '~~/server/types/api/football/external'
import type { FootballLeaguesApiResponse } from '~~/server/types/api/football'

export default defineEventHandler(
  async (event): Promise<FootballLeaguesApiResponse> => {
    const payload = await cachedFootballApiGet<ApiSportsLeagueItem>(
      event,
      '/leagues',
      {},
      { cacheProfile: 'reference', cacheKeySuffix: 'reference-leagues' },
    )
    return mapLeaguesResponse(payload)
  },
)
