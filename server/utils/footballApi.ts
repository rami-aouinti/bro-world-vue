import type { H3Event } from 'h3'
import { getCached, publicCacheKey, setCached } from './apiCache'
import { resolveCacheProfileFromSuffix, resolveCacheTtl } from './apiCacheConfig'
import type {
  FootballFixture,
  FootballFixtureDetailsApiResponse,
  FootballFixtureEvent,
  FootballFixturesApiResponse,
  FootballLeague,
  FootballLeaguesApiResponse,
  FootballLineup,
  FootballLineupPlayer,
  FootballPlayerStatistic,
  FootballStandingRow,
  FootballStandingsApiResponse,
  FootballTeam,
  FootballTeamsApiResponse,
} from '../types/api/football'
import type {
  ApiSportsFixtureEventItem,
  ApiSportsFixtureItem,
  ApiSportsLeagueItem,
  ApiSportsPlayerItem,
  ApiSportsSquadItem,
  ApiSportsLineupItem,
  ApiSportsTeamStatisticsItem,
  ApiSportsPlayerStatsItem,
  ApiSportsResponse,
  ApiSportsStandingLeagueItem,
  ApiSportsTeamItem,
} from '../types/api/football/external'

type FootballQueryParams = Record<string, string | number>
type FootballCacheProfile = 'reference' | 'live'

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

export function getRequiredFootballId(event: H3Event, name: string) {
  const query = getQuery(event)
  return parseIntegerParam(query[name], name)
}

export function getOptionalFootballId(event: H3Event, name: string) {
  const query = getQuery(event)
  const raw = query[name]

  if (typeof raw === 'undefined' || raw === null || raw === '') {
    return undefined
  }

  return parseIntegerParam(raw, name)
}

function mapTeamBase(team: {
  id: number
  name: string
  code?: string | null
  country?: string | null
  founded?: number | null
  national?: boolean
  logo: string | null
}): FootballTeam {
  return {
    id: team.id,
    name: team.name,
    code: team.code ?? null,
    country: team.country ?? null,
    founded: team.founded ?? null,
    national: team.national ?? false,
    logo: team.logo,
  }
}

export function mapLeaguesResponse(
  payload: ApiSportsResponse<ApiSportsLeagueItem>,
): FootballLeaguesApiResponse {
  return {
    items: (payload.response ?? []).map(
      (item): FootballLeague => ({
        id: item.league.id,
        name: item.league.name,
        type: item.league.type,
        logo: item.league.logo,
        country: {
          name: item.country.name,
          code: item.country.code,
          flag: item.country.flag,
        },
        seasons: (item.seasons ?? []).map((season) => ({
          year: season.year,
          start: season.start,
          end: season.end,
          current: season.current,
          coverage: {
            fixtures: {
              events: season.coverage.fixtures.events,
              lineups: season.coverage.fixtures.lineups,
              statisticsFixtures: season.coverage.fixtures.statistics_fixtures,
              statisticsPlayers: season.coverage.fixtures.statistics_players,
            },
            standings: season.coverage.standings,
            players: season.coverage.players,
            topScorers: season.coverage.top_scorers,
            topAssists: season.coverage.top_assists,
            topCards: season.coverage.top_cards,
            injuries: season.coverage.injuries,
            predictions: season.coverage.predictions,
            odds: season.coverage.odds,
          },
        })),
      }),
    ),
  }
}

function mapFixture(item: ApiSportsFixtureItem): FootballFixture {
  return {
    id: item.fixture.id,
    referee: item.fixture.referee,
    timezone: item.fixture.timezone,
    date: item.fixture.date,
    timestamp: item.fixture.timestamp,
    venue: item.fixture.venue,
    status: {
      short: item.fixture.status.short,
      long: item.fixture.status.long,
      elapsed: item.fixture.status.elapsed,
    },
    league: item.league,
    teams: {
      home: {
        ...mapTeamBase(item.teams.home),
        winner: item.teams.home.winner,
      },
      away: {
        ...mapTeamBase(item.teams.away),
        winner: item.teams.away.winner,
      },
    },
    goals: item.goals,
    score: item.score,
  }
}

export function mapFixturesResponse(
  payload: ApiSportsResponse<ApiSportsFixtureItem>,
): FootballFixturesApiResponse {
  return {
    items: (payload.response ?? []).map(mapFixture),
  }
}

export function mapTeamsResponse(
  payload: ApiSportsResponse<ApiSportsTeamItem>,
): FootballTeamsApiResponse {
  return {
    items: (payload.response ?? []).map((entry) => mapTeamBase(entry.team)),
  }
}

export function mapTeamStatisticsResponse(
  payload: ApiSportsResponse<ApiSportsTeamStatisticsItem>,
) {
  const response = payload.response as
    | ApiSportsTeamStatisticsItem
    | ApiSportsTeamStatisticsItem[]
    | undefined
  const item = Array.isArray(response) ? response[0] : response

  if (!item) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Team statistics not found',
    })
  }

  return {
    league: item.league,
    team: {
      ...mapTeamBase(item.team),
      national: false,
      code: null,
      country: null,
      founded: null,
    },
    form: item.form,
    fixtures: item.fixtures,
    goals: item.goals,
    biggest: item.biggest,
    cleanSheet: item.clean_sheet,
    failedToScore: item.failed_to_score,
    penalty: item.penalty,
    lineups: item.lineups,
    cards: item.cards,
  }
}

export function mapTeamSquadResponse(payload: ApiSportsResponse<ApiSportsSquadItem>) {
  const item = payload.response?.[0]

  if (!item) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Team squad not found',
    })
  }

  return {
    team: {
      ...mapTeamBase(item.team),
      national: false,
      code: null,
      country: null,
      founded: null,
    },
    players: (item.players ?? []).map((player) => ({
      id: player.id,
      name: player.name,
      age: player.age,
      number: player.number,
      position: player.position,
      photo: player.photo,
    })),
  }
}

export function mapPlayerResponse(payload: ApiSportsResponse<ApiSportsPlayerItem>) {
  const item = payload.response?.[0]

  if (!item) {
    return {
      profile: null,
      statistics: [],
    }
  }

  return {
    profile: item.player,
    statistics: item.statistics ?? [],
  }
}

export function mapStandingsResponse(
  payload: ApiSportsResponse<ApiSportsStandingLeagueItem>,
): FootballStandingsApiResponse {
  const leagueEntry = payload.response?.[0]?.league

  if (!leagueEntry) {
    return {
      league: {
        id: 0,
        name: '',
        country: '',
        logo: null,
        flag: null,
        season: 0,
      },
      groups: [],
    }
  }

  return {
    league: {
      id: leagueEntry.id,
      name: leagueEntry.name,
      country: leagueEntry.country,
      logo: leagueEntry.logo,
      flag: leagueEntry.flag,
      season: leagueEntry.season,
    },
    groups: (leagueEntry.standings ?? []).map(
      (rows): { name: string; rows: FootballStandingRow[] } => ({
        name: rows[0]?.group ?? 'General',
        rows: rows.map((row) => ({
          rank: row.rank,
          team: mapTeamBase(row.team),
          points: row.points,
          goalsDiff: row.goalsDiff,
          group: row.group,
          form: row.form,
          status: row.status,
          description: row.description,
          all: row.all,
        })),
      }),
    ),
  }
}

function mapEvent(item: ApiSportsFixtureEventItem): FootballFixtureEvent {
  return {
    time: item.time,
    team: item.team,
    player: item.player,
    assist: item.assist,
    type: item.type,
    detail: item.detail,
    comments: item.comments,
  }
}

function mapLineupPlayer(item: {
  player: FootballLineupPlayer
}): FootballLineupPlayer {
  return item.player
}

function mapLineup(item: ApiSportsLineupItem): FootballLineup {
  return {
    team: item.team,
    coach: item.coach,
    formation: item.formation,
    startXI: (item.startXI ?? []).map(mapLineupPlayer),
    substitutes: (item.substitutes ?? []).map(mapLineupPlayer),
  }
}

function mapPlayerStats(
  item: ApiSportsPlayerStatsItem,
): FootballPlayerStatistic[] {
  return (item.players ?? []).map((playerStats) => ({
    team: item.team,
    player: playerStats.player,
    statistics: playerStats.statistics,
  }))
}

export async function callFootballApi<TItem>(
  event: H3Event,
  endpoint: string,
  query: FootballQueryParams,
): Promise<ApiSportsResponse<TItem>> {
  const runtimeConfig = useRuntimeConfig(event)
  const baseUrl =
    runtimeConfig.footballApi?.baseUrl || 'https://v3.football.api-sports.io'
  const apiKey = runtimeConfig.footballApi?.key
  const host = runtimeConfig.footballApi?.host || 'v3.football.api-sports.io'

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing football API key in runtime config',
    })
  }

  try {
    return await $fetch<ApiSportsResponse<TItem>>(`${baseUrl}${endpoint}`, {
      method: 'GET',
      query,
      headers: {
        'x-apisports-key': apiKey,
        'x-rapidapi-host': host,
        accept: 'application/json',
      },
    })
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode ?? error?.response?.status ?? 502,
      statusMessage:
        error?.data?.message ||
        error?.statusMessage ||
        'Failed to fetch football data from upstream provider',
    })
  }
}

export async function cachedFootballApiGet<TItem>(
  event: H3Event,
  endpoint: string,
  query: FootballQueryParams,
  options?: {
    cacheProfile?: FootballCacheProfile
    cacheKeySuffix?: string
  },
): Promise<ApiSportsResponse<TItem>> {
  const cacheSuffix = options?.cacheKeySuffix ?? options?.cacheProfile ?? 'default'
  const cacheProfile = options?.cacheProfile ?? resolveCacheProfileFromSuffix(cacheSuffix)
  const cacheKey = publicCacheKey(
    `/sports/football${endpoint}:${cacheSuffix}`,
    query,
  )

  const cached = await getCached<ApiSportsResponse<TItem>>(cacheKey)
  if (cached) {
    return cached
  }

  const payload = await callFootballApi<TItem>(event, endpoint, query)
  await setCached(
    cacheKey,
    payload,
    resolveCacheTtl('football', cacheProfile),
  )

  return payload
}

export async function fetchFixtureDetails(
  event: H3Event,
  fixture: number,
): Promise<FootballFixtureDetailsApiResponse> {
  const [fixtures, events, lineups, players] = await Promise.all([
    cachedFootballApiGet<ApiSportsFixtureItem>(
      event,
      '/fixtures',
      { id: fixture },
      { cacheProfile: 'reference', cacheKeySuffix: 'reference-fixture' },
    ),
    cachedFootballApiGet<ApiSportsFixtureEventItem>(
      event,
      '/fixtures/events',
      { fixture },
      { cacheProfile: 'reference', cacheKeySuffix: 'reference-fixture-events' },
    ),
    cachedFootballApiGet<ApiSportsLineupItem>(
      event,
      '/fixtures/lineups',
      { fixture },
      { cacheProfile: 'reference', cacheKeySuffix: 'reference-fixture-lineups' },
    ),
    cachedFootballApiGet<ApiSportsPlayerStatsItem>(
      event,
      '/fixtures/players',
      { fixture },
      { cacheProfile: 'reference', cacheKeySuffix: 'reference-fixture-players' },
    ),
  ])

  return {
    fixture: fixtures.response?.[0] ? mapFixture(fixtures.response[0]) : null,
    events: (events.response ?? []).map(mapEvent),
    lineups: (lineups.response ?? []).map(mapLineup),
    playerStats: (players.response ?? []).flatMap(mapPlayerStats),
  }
}

export async function cachedFixtureDetails(
  event: H3Event,
  fixture: number,
): Promise<FootballFixtureDetailsApiResponse> {
  const cacheKey = publicCacheKey('/sports/football/fixture:reference', { fixture })
  const cached = await getCached<FootballFixtureDetailsApiResponse>(cacheKey)

  if (cached) {
    return cached
  }

  const payload = await fetchFixtureDetails(event, fixture)
  await setCached(cacheKey, payload, resolveCacheTtl('football', 'reference'))

  return payload
}
