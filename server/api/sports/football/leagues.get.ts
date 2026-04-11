import { callFootballApi, mapLeaguesResponse } from '../../../utils/footballApi'
import type { ApiSportsLeagueItem } from '~~/server/types/api/football/external'
import type { FootballLeaguesApiResponse } from '~~/server/types/api/football'

export default defineEventHandler(
  async (event): Promise<FootballLeaguesApiResponse> => {
    const payload = await callFootballApi<ApiSportsLeagueItem>(
      event,
      '/leagues',
      {},
    )
    return mapLeaguesResponse(payload)
  },
)
