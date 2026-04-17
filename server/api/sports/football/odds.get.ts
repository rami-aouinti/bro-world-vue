import {
  cachedFootballApiGet,
  getOptionalFootballId,
  getRequiredFootballId,
  mapOddsResponse,
} from '../../../utils/footballApi'
import type { FootballOddsApiResponse } from '~~/server/types/api/football'
import type { ApiSportsOddsItem } from '~~/server/types/api/football/external'

export default defineEventHandler(
  async (event): Promise<FootballOddsApiResponse> => {
    const league = getRequiredFootballId(event, 'league')
    const season = getRequiredFootballId(event, 'season')
    const fixture = getOptionalFootballId(event, 'fixture')
    const bookmaker = getOptionalFootballId(event, 'bookmaker')
    const bet = getOptionalFootballId(event, 'bet')
    const page = getOptionalFootballId(event, 'page')

    const payload = await cachedFootballApiGet<ApiSportsOddsItem>(
      event,
      '/odds',
      {
        league,
        season,
        ...(fixture ? { fixture } : {}),
        ...(bookmaker ? { bookmaker } : {}),
        ...(bet ? { bet } : {}),
        ...(page ? { page } : {}),
      },
      { cacheProfile: 'live', cacheKeySuffix: 'live-odds' },
    )

    return mapOddsResponse(payload)
  },
)
