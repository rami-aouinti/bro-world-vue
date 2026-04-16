import {
  cachedFootballApiGet,
  getOptionalFootballId,
  getRequiredFootballId,
  mapPlayerResponse,
} from '../../../utils/footballApi'
import type { FootballPlayerApiResponse } from '~~/server/types/api/football'
import type { ApiSportsPlayerItem } from '~~/server/types/api/football/external'

export default defineEventHandler(async (event): Promise<FootballPlayerApiResponse> => {
  const player = getRequiredFootballId(event, 'player')
  const season = getRequiredFootballId(event, 'season')
  const league = getOptionalFootballId(event, 'league')
  const team = getOptionalFootballId(event, 'team')

  const payload = await cachedFootballApiGet<ApiSportsPlayerItem>(
    event,
    '/players',
    {
      id: player,
      season,
      ...(league ? { league } : {}),
      ...(team ? { team } : {}),
    },
    { cacheProfile: 'reference', cacheKeySuffix: 'reference-player' },
  )

  return mapPlayerResponse(payload)
})
