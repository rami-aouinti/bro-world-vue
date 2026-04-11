import {
  callFootballApi,
  getRequiredFootballId,
  mapTeamsResponse,
} from '../../../utils/footballApi'
import type { FootballTeamsApiResponse } from '~~/server/types/api/football'
import type { ApiSportsTeamItem } from '~~/server/types/api/football/external'

export default defineEventHandler(
  async (event): Promise<FootballTeamsApiResponse> => {
    const league = getRequiredFootballId(event, 'league')
    const season = getRequiredFootballId(event, 'season')

    const query = getQuery(event)
    const teamParam = query.team
    const team =
      typeof teamParam === 'string' && teamParam.length > 0
        ? Number(teamParam)
        : undefined

    if (typeof team !== 'undefined' && (!Number.isInteger(team) || team <= 0)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid query parameter: team',
      })
    }

    const payload = await callFootballApi<ApiSportsTeamItem>(event, '/teams', {
      league,
      season,
      ...(team ? { id: team } : {}),
    })

    return mapTeamsResponse(payload)
  },
)
