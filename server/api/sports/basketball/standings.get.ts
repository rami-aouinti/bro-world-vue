import {
  cachedBasketballApiGet,
  getRequiredBasketballId,
  getRequiredBasketballSeason,
  mapBasketballStandingsResponse,
} from '../../../utils/basketballApi'
import type { BasketballStandingsApiResponse } from '~~/server/types/api/basketball'
import type { ApiSportsBasketballStandingItem } from '~~/server/types/api/basketball/external'

export default defineEventHandler(
  async (
    event,
  ): Promise<
    BasketballStandingsApiResponse & {
      meta: {
        league: number
        season: number
        standingsAvailable: boolean
        reason: string | null
      }
    }
  > => {
    const league = getRequiredBasketballId(event, 'league')
    const season = getRequiredBasketballSeason(event)

    try {
      const payload =
        await cachedBasketballApiGet<ApiSportsBasketballStandingItem>(
          event,
          '/standings',
          { league, season },
          { cacheProfile: 'reference', cacheKeySuffix: 'reference-standings' },
        )

      const mapped = mapBasketballStandingsResponse(payload)
      return {
        ...mapped,
        meta: {
          league,
          season,
          standingsAvailable: mapped.groups.length > 0,
          reason: mapped.groups.length > 0 ? null : 'empty_source_payload',
        },
      }
    } catch (error: any) {
      const statusMessage = String(error?.statusMessage ?? error?.message ?? '')
      const normalizedMessage = statusMessage.toLowerCase()
      const isSourceWithoutStandings =
        normalizedMessage.includes('standings') &&
        (normalizedMessage.includes('not available') ||
          normalizedMessage.includes('unavailable'))

      if (isSourceWithoutStandings) {
        return {
          groups: [],
          league: {
            id: league,
            name: null,
            season: String(season),
            logo: null,
            country: null,
          },
          meta: {
            league,
            season,
            standingsAvailable: false,
            reason: 'source_without_standings',
          },
        }
      }

      throw error
    }
  },
)
