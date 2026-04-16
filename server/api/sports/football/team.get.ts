import {
  cachedFootballApiGet,
  getRequiredFootballId,
  mapTeamStatisticsResponse,
  mapTeamSquadResponse,
} from '../../../utils/footballApi'
import type {
  FootballTeamSquadApiResponse,
  FootballTeamStatisticsApiResponse,
} from '~~/server/types/api/football'
import type {
  ApiSportsSquadItem,
  ApiSportsTeamStatisticsItem,
} from '~~/server/types/api/football/external'

export default defineEventHandler(async (event) => {
  const team = getRequiredFootballId(event, 'team')
  const league = getRequiredFootballId(event, 'league')
  const season = getRequiredFootballId(event, 'season')

  const [statisticsPayload, squadPayload] = await Promise.all([
    cachedFootballApiGet<ApiSportsTeamStatisticsItem>(
      event,
      '/teams/statistics',
      { team, league, season },
      { cacheProfile: 'reference', cacheKeySuffix: 'reference-team-statistics' },
    ),
    cachedFootballApiGet<ApiSportsSquadItem>(
      event,
      '/players/squads',
      { team },
      { cacheProfile: 'reference', cacheKeySuffix: 'reference-team-squad' },
    ),
  ])

  return {
    statistics: mapTeamStatisticsResponse(
      statisticsPayload,
    ) as FootballTeamStatisticsApiResponse,
    squad: mapTeamSquadResponse(squadPayload) as FootballTeamSquadApiResponse,
  }
})
