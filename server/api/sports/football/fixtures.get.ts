import {
  cachedFootballApiGet,
  getRequiredFootballId,
  mapFixturesResponse,
} from '../../../utils/footballApi'
import type { FootballFixturesApiResponse } from '~~/server/types/api/football'
import type { ApiSportsFixtureItem } from '~~/server/types/api/football/external'

export default defineEventHandler(
  async (event): Promise<FootballFixturesApiResponse> => {
    const league = getRequiredFootballId(event, 'league')
    const season = getRequiredFootballId(event, 'season')

    const payload = await cachedFootballApiGet<ApiSportsFixtureItem>(
      event,
      '/fixtures',
      {
        league,
        season,
      },
      { cacheProfile: 'reference', cacheKeySuffix: 'reference-fixtures' },
    )

    return mapFixturesResponse(payload)
  },
)
