import type { H3Event } from 'h3'
import { getCached, publicCacheKey, setCached } from './apiCache'
import {
  resolveCacheProfileFromSuffix,
  resolveCacheTtl,
} from './apiCacheConfig'
import { getPersistentCached, setPersistentCached } from './persistentApiCache'
import type {
  BasketballGame,
  BasketballGameDetailsApiResponse,
  BasketballGamesApiResponse,
  BasketballLeague,
  BasketballLeaguesApiResponse,
  BasketballPlayerApiResponse,
  BasketballStandingsApiResponse,
  BasketballTeam,
  BasketballTeamApiResponse,
  BasketballTeamsApiResponse,
} from '../types/api/basketball'
import type {
  ApiSportsBasketballGameItem,
  ApiSportsBasketballLeagueItem,
  ApiSportsBasketballPlayerItem,
  ApiSportsBasketballResponse,
  ApiSportsBasketballStandingItem,
  ApiSportsBasketballTeamItem,
} from '../types/api/basketball/external'

type BasketballQueryParams = Record<string, string | number>
type BasketballCacheProfile = 'reference' | 'live'

function parseIntegerParam(value: unknown, name: string) {
  const normalized = Array.isArray(value) ? value[0] : value
  const parsed = Number(normalized)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid query parameter: ${name}`,
    })
  }

  return parsed
}

export function getRequiredBasketballId(event: H3Event, name: string) {
  const query = getQuery(event)
  return parseIntegerParam(query[name], name)
}

export function getOptionalBasketballId(event: H3Event, name: string) {
  const query = getQuery(event)
  const raw = query[name]

  if (typeof raw === 'undefined' || raw === null || raw === '') {
    return undefined
  }

  return parseIntegerParam(raw, name)
}

export function getRequiredBasketballSeason(event: H3Event) {
  return getRequiredBasketballId(event, 'season')
}

export function getOptionalBasketballSeason(event: H3Event) {
  return getOptionalBasketballId(event, 'season')
}

function mapCountry(
  country?: {
    id: number | null
    name: string
    code: string | null
    flag: string | null
  } | null,
) {
  if (!country) {
    return null
  }

  return {
    id: country.id,
    name: country.name,
    code: country.code,
    flag: country.flag,
  }
}

function mapTeamBase(team: ApiSportsBasketballTeamItem): BasketballTeam {
  return {
    id: team.id,
    name: team.name,
    code: team.code ?? null,
    logo: team.logo ?? null,
    country: mapCountry(team.country),
    founded: team.founded ?? null,
    national: team.national ?? false,
  }
}

function mapGame(item: ApiSportsBasketballGameItem): BasketballGame {
  return {
    id: item.id,
    date: item.date,
    time: item.time,
    timestamp: item.timestamp,
    timezone: item.timezone,
    stage: item.stage,
    week: item.week,
    status: {
      long: item.status?.long ?? null,
      short: item.status?.short ?? null,
      timer: item.status?.timer ?? null,
    },
    league: item.league,
    country: mapCountry(item.country),
    teams: {
      home: mapTeamBase(item.teams.home),
      away: mapTeamBase(item.teams.away),
    },
    scores: item.scores,
    periods: item.periods,
  }
}

export function mapBasketballLeaguesResponse(
  payload: ApiSportsBasketballResponse<ApiSportsBasketballLeagueItem>,
): BasketballLeaguesApiResponse {
  return {
    items: (payload.response ?? []).map(
      (item): BasketballLeague => ({
        id: item.id,
        name: item.name,
        type: item.type,
        logo: item.logo ?? null,
        country: {
          id: item.country.id,
          name: item.country.name,
          code: item.country.code,
          flag: item.country.flag,
        },
        seasons: (item.seasons ?? []).map((season) => ({
          season: season.season,
          start: season.start ?? null,
          end: season.end ?? null,
          coverage: {
            games: {
              statistics: {
                teams: season.coverage?.games?.statistics?.teams ?? false,
                players: season.coverage?.games?.statistics?.players ?? false,
              },
            },
            standings: season.coverage?.standings ?? false,
            players: season.coverage?.players ?? false,
            odds: season.coverage?.odds ?? false,
          },
        })),
      }),
    ),
  }
}

export function mapBasketballTeamsResponse(
  payload: ApiSportsBasketballResponse<ApiSportsBasketballTeamItem>,
): BasketballTeamsApiResponse {
  return {
    items: (payload.response ?? []).map((item) => mapTeamBase(item)),
  }
}

export function mapBasketballGamesResponse(
  payload: ApiSportsBasketballResponse<ApiSportsBasketballGameItem>,
): BasketballGamesApiResponse {
  return {
    items: (payload.response ?? []).map((item) => mapGame(item)),
  }
}

export function mapBasketballStandingsResponse(
  payload:
    | ApiSportsBasketballResponse<ApiSportsBasketballStandingItem>
    | null
    | undefined,
): BasketballStandingsApiResponse {
  const emptyResponse: BasketballStandingsApiResponse = {
    league: {
      id: null,
      name: null,
      season: null,
      logo: null,
      country: null,
    },
    groups: [],
  }

  if (
    !payload ||
    !Array.isArray(payload.response) ||
    payload.response.length === 0
  ) {
    return emptyResponse
  }

  const normalizedRows = payload.response
    .filter((entry): entry is ApiSportsBasketballStandingItem => Boolean(entry))
    .map((entry) => {
      const hasTeamShape =
        entry.team &&
        typeof entry.team.id === 'number' &&
        typeof entry.team.name === 'string'
      const team = hasTeamShape
        ? mapTeamBase(entry.team)
        : {
            id: 0,
            name: 'Unknown team',
            code: null,
            logo: null,
            country: null,
            founded: null,
            national: false,
          }

      return {
        position:
          typeof entry.position === 'number' && Number.isFinite(entry.position)
            ? entry.position
            : 0,
        team,
        played: entry.games?.played ?? 0,
        win: {
          total: entry.games?.win?.total ?? 0,
          percentage: entry.games?.win?.percentage ?? null,
        },
        lose: {
          total: entry.games?.lose?.total ?? 0,
          percentage: entry.games?.lose?.percentage ?? null,
        },
        points: {
          for: entry.points?.for ?? 0,
          against: entry.points?.against ?? 0,
        },
        form: entry.form ?? null,
        group: {
          name: entry.group?.name ?? null,
        },
      }
    })

  if (!normalizedRows.length) {
    return emptyResponse
  }

  const firstEntry = payload.response[0]

  return {
    league: {
      id: firstEntry?.league?.id ?? null,
      name: firstEntry?.league?.name ?? null,
      season: firstEntry?.league?.season ?? null,
      logo: firstEntry?.league?.logo ?? null,
      country: mapCountry(firstEntry?.country),
    },
    groups: [
      {
        name: firstEntry?.group?.name || 'General',
        rows: normalizedRows,
      },
    ],
  }
}

export function mapBasketballPlayerResponse(
  payload: ApiSportsBasketballResponse<ApiSportsBasketballPlayerItem>,
): BasketballPlayerApiResponse {
  const item = payload.response?.[0]

  if (!item) {
    return {
      profile: null,
      statistics: [],
    }
  }

  return {
    profile: {
      id: item.id,
      firstname: item.firstname,
      lastname: item.lastname,
      birth: item.birth,
      nba: item.nba,
      height: item.height,
      weight: item.weight,
      college: item.college,
      affiliation: item.affiliation,
    },
    statistics: [item.leagues],
  }
}

export function mapBasketballTeamResponse(
  payload: ApiSportsBasketballResponse<ApiSportsBasketballTeamItem>,
): BasketballTeamApiResponse {
  const item = payload.response?.[0]

  return {
    profile: item ? mapTeamBase(item) : null,
  }
}

export function mapBasketballGameDetailsResponse(
  payload: ApiSportsBasketballResponse<ApiSportsBasketballGameItem>,
): BasketballGameDetailsApiResponse {
  const item = payload.response?.[0]

  return {
    game: item ? mapGame(item) : null,
  }
}

export async function callBasketballApi<TItem>(
  event: H3Event,
  endpoint: string,
  query: BasketballQueryParams,
): Promise<ApiSportsBasketballResponse<TItem>> {
  const runtimeConfig = useRuntimeConfig(event)
  const baseUrl =
    runtimeConfig.basketballApi?.baseUrl ||
    'https://v1.basketball.api-sports.io'
  const apiKey = runtimeConfig.basketballApi?.key
  const host =
    runtimeConfig.basketballApi?.host || 'v1.basketball.api-sports.io'

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing basketball API key in runtime config',
    })
  }

  try {
    return await $fetch<ApiSportsBasketballResponse<TItem>>(
      `${baseUrl}${endpoint}`,
      {
        method: 'GET',
        query,
        headers: {
          'x-apisports-key': apiKey,
          'x-rapidapi-host': host,
          accept: 'application/json',
        },
      },
    )
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode ?? error?.response?.status ?? 502,
      statusMessage:
        error?.data?.message ||
        error?.statusMessage ||
        'Failed to fetch basketball data from upstream provider',
    })
  }
}

export async function cachedBasketballApiGet<TItem>(
  event: H3Event,
  endpoint: string,
  query: BasketballQueryParams,
  options?: {
    cacheProfile?: BasketballCacheProfile
    cacheKeySuffix?: string
  },
): Promise<ApiSportsBasketballResponse<TItem>> {
  const cacheSuffix =
    options?.cacheKeySuffix ?? options?.cacheProfile ?? 'default'
  const cacheProfile =
    options?.cacheProfile ?? resolveCacheProfileFromSuffix(cacheSuffix)
  const ttl = resolveCacheTtl('sports', cacheProfile)
  const cacheKey = publicCacheKey(
    `/sports/basketball${endpoint}:${cacheSuffix}`,
    query,
  )

  const redisCached =
    await getCached<ApiSportsBasketballResponse<TItem>>(cacheKey)
  if (redisCached) {
    return redisCached
  }

  const persistentCached =
    await getPersistentCached<ApiSportsBasketballResponse<TItem>>(cacheKey)
  if (persistentCached) {
    await setCached(cacheKey, persistentCached, ttl)
    return persistentCached
  }

  const payload = await callBasketballApi<TItem>(event, endpoint, query)
  await Promise.all([
    setCached(cacheKey, payload, ttl),
    setPersistentCached(cacheKey, payload, ttl),
  ])

  return payload
}
