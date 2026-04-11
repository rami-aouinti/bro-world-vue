import {
  callFootballApi,
  getRequiredFootballId,
  mapStandingsResponse,
} from '../../../utils/footballApi'
import type { FootballStandingsApiResponse } from '~~/server/types/api/football'
import type { ApiSportsStandingLeagueItem } from '~~/server/types/api/football/external'

export default defineEventHandler(
  async (event): Promise<FootballStandingsApiResponse> => {
    const league = getRequiredFootballId(event, 'league')
    const season = getRequiredFootballId(event, 'season')

    const payload = await callFootballApi<ApiSportsStandingLeagueItem>(
      event,
      '/standings',
      {
        league,
        season,
      },
    )

    return mapStandingsResponse(payload)
  },
)
