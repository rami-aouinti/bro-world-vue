import {
  cachedFootballApiGet,
  getRequiredFootballId,
  mapStandingsResponse,
} from '../../../utils/footballApi'
import type { FootballStandingsApiResponse } from '~~/server/types/api/football'
import type { ApiSportsStandingLeagueItem } from '~~/server/types/api/football/external'

export default defineEventHandler(
  async (event): Promise<FootballStandingsApiResponse> => {
    const league = getRequiredFootballId(event, 'league')
    const season = getRequiredFootballId(event, 'season')

    const payload = await cachedFootballApiGet<ApiSportsStandingLeagueItem>(
      event,
      '/standings',
      {
        league,
        season,
      },
      { cacheProfile: 'reference', cacheKeySuffix: 'reference-standings' },
    )

    return mapStandingsResponse(payload)
  },
)
