import type { H3Event } from 'h3'
import { getCached, publicCacheKey, setCached } from './apiCache'
import {
  resolveCacheProfileFromSuffix,
  resolveCacheTtl,
} from './apiCacheConfig'
import { getPersistentCached, setPersistentCached } from './persistentApiCache'
import type {
  FootballCoverageIndicator,
  FootballFixture,
  FootballFixtureAvailabilityPlayer,
  FootballFixtureDetailsApiResponse,
  FootballFixtureMatchContext,
  FootballFixtureStatisticsMetricKey,
  FootballFixtureStatisticsMetricValue,
  FootballFixtureTeamStatistics,
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
  FootballOddsApiResponse,
} from '../types/api/football'
import type { ApiObject } from '../types/api/common'
import type {
  ApiSportsFixtureEventItem,
  ApiSportsFixtureInjuryItem,
  ApiSportsFixtureItem,
  ApiSportsFixturePredictionItem,
  ApiSportsFixtureStatisticsItem,
  ApiSportsLeagueItem,
  ApiSportsPlayerItem,
  ApiSportsSquadItem,
  ApiSportsLineupItem,
  ApiSportsTeamStatisticsItem,
  ApiSportsPlayerStatsItem,
  ApiSportsResponse,
  ApiSportsStandingLeagueItem,
  ApiSportsTeamItem,
  ApiSportsOddsItem,
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

function toCoverageIndicator(
  covered: boolean,
  hasData: boolean,
): FootballCoverageIndicator {
  return {
    covered,
    available: covered && hasData,
    status: !covered ? 'not-covered' : hasData ? 'available' : 'unavailable',
  }
}

function mapFixtureAvailabilityPlayer(
  item: ApiSportsFixtureInjuryItem,
): FootballFixtureAvailabilityPlayer {
  return {
    playerId: item.player.id,
    playerName: item.player.name,
    playerPhoto: item.player.photo,
    teamId: item.team.id,
    teamName: item.team.name,
    teamLogo: item.team.logo,
    type: item.player.type,
    reason: item.player.reason,
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

export function mapTeamSquadResponse(
  payload: ApiSportsResponse<ApiSportsSquadItem>,
) {
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

export function mapPlayerResponse(
  payload: ApiSportsResponse<ApiSportsPlayerItem>,
) {
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

export function mapOddsResponse(
  payload: ApiSportsResponse<ApiSportsOddsItem>,
): FootballOddsApiResponse {
  return {
    items: payload.response ?? [],
    paging: payload.paging ?? { current: 1, total: 1 },
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

type FixtureStatsPeriodKey = 'match' | 'firstHalf' | 'secondHalf'
type FixtureTeamSide = 'home' | 'away'

const FIXTURE_STAT_METRIC_KEYS: FootballFixtureStatisticsMetricKey[] = [
  'xg',
  'possession',
  'shotsTotal',
  'shotsOnTarget',
  'bigChances',
  'passes',
  'corners',
  'cards',
]

function normalizeStatisticValue(
  value: unknown,
): FootballFixtureStatisticsMetricValue {
  if (value === null || typeof value === 'undefined') return null

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed) return null

  const hasPercentage = trimmed.endsWith('%')
  const numericValue = hasPercentage ? trimmed.slice(0, -1).trim() : trimmed
  const parsed = Number(numericValue)

  if (Number.isFinite(parsed)) {
    return hasPercentage ? `${parsed}%` : parsed
  }

  return trimmed
}

function normalizeStatisticTypeLabel(type: string) {
  return type.toLowerCase().replace(/\s+/g, ' ').trim()
}

function getStatisticPeriod(type: string): FixtureStatsPeriodKey {
  const normalized = normalizeStatisticTypeLabel(type)

  if (normalized.includes('1st half') || normalized.includes('first half')) {
    return 'firstHalf'
  }

  if (normalized.includes('2nd half') || normalized.includes('second half')) {
    return 'secondHalf'
  }

  return 'match'
}

function resolveMetricFromType(
  type: string,
): FootballFixtureStatisticsMetricKey | null {
  const normalized = normalizeStatisticTypeLabel(type)

  if (normalized.includes('expected goals') || normalized === 'xg') return 'xg'
  if (normalized.includes('ball possession') || normalized === 'possession')
    return 'possession'
  if (normalized.includes('total shots')) return 'shotsTotal'
  if (
    normalized.includes('shots on goal') ||
    normalized.includes('shots on target')
  )
    return 'shotsOnTarget'
  if (normalized.includes('big chances')) return 'bigChances'
  if (normalized.includes('total passes') || normalized === 'passes')
    return 'passes'
  if (normalized.includes('corner kicks') || normalized === 'corners')
    return 'corners'
  if (
    normalized.includes('yellow cards') ||
    normalized.includes('red cards') ||
    normalized === 'cards'
  )
    return 'cards'

  return null
}

function createEmptyFixturePeriod() {
  return {
    home: {} as Partial<
      Record<
        FootballFixtureStatisticsMetricKey,
        FootballFixtureStatisticsMetricValue
      >
    >,
    away: {} as Partial<
      Record<
        FootballFixtureStatisticsMetricKey,
        FootballFixtureStatisticsMetricValue
      >
    >,
  }
}

function mergeCardValues(
  current: FootballFixtureStatisticsMetricValue | undefined,
  incoming: FootballFixtureStatisticsMetricValue,
): FootballFixtureStatisticsMetricValue {
  if (incoming === null) return current ?? null
  if (typeof current === 'number' && typeof incoming === 'number') {
    return current + incoming
  }

  return incoming
}

function mapFixtureStatistics(
  fixture: FootballFixture | null,
  statistics: ApiSportsFixtureStatisticsItem[] | undefined,
): FootballFixtureTeamStatistics {
  const mapped: FootballFixtureTeamStatistics = {
    match: createEmptyFixturePeriod(),
  }

  const entries = statistics ?? []
  if (!entries.length) {
    return mapped
  }

  const homeTeamId = fixture?.teams.home.id ?? null
  const awayTeamId = fixture?.teams.away.id ?? null

  entries.forEach((teamStats, index) => {
    const side: FixtureTeamSide =
      teamStats.team.id === homeTeamId
        ? 'home'
        : teamStats.team.id === awayTeamId
          ? 'away'
          : index === 0
            ? 'home'
            : 'away'

    ;(teamStats.statistics ?? []).forEach((metricItem) => {
      const metricKey = resolveMetricFromType(metricItem.type)
      if (!metricKey) return

      const periodKey = getStatisticPeriod(metricItem.type)
      if (!mapped[periodKey]) {
        mapped[periodKey] = createEmptyFixturePeriod()
      }

      const normalizedValue = normalizeStatisticValue(metricItem.value)
      const period = mapped[periodKey]
      if (!period) return

      if (metricKey === 'cards') {
        period[side].cards = mergeCardValues(
          period[side].cards,
          normalizedValue,
        )
        return
      }

      period[side][metricKey] = normalizedValue
    })
  })

  FIXTURE_STAT_METRIC_KEYS.forEach((key) => {
    if (typeof mapped.match.home[key] === 'undefined')
      mapped.match.home[key] = null
    if (typeof mapped.match.away[key] === 'undefined')
      mapped.match.away[key] = null
  })

  return mapped
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
  const cacheSuffix =
    options?.cacheKeySuffix ?? options?.cacheProfile ?? 'default'
  const cacheProfile =
    options?.cacheProfile ?? resolveCacheProfileFromSuffix(cacheSuffix)
  const ttl = resolveCacheTtl('football', cacheProfile)
  const cacheKey = publicCacheKey(
    `/sports/football${endpoint}:${cacheSuffix}`,
    query,
  )

  const redisCached = await getCached<ApiSportsResponse<TItem>>(cacheKey)
  if (redisCached) {
    return redisCached
  }

  const persistentCached =
    await getPersistentCached<ApiSportsResponse<TItem>>(cacheKey)
  if (persistentCached) {
    await setCached(cacheKey, persistentCached, ttl)
    return persistentCached
  }

  const payload = await callFootballApi<TItem>(event, endpoint, query)
  await Promise.all([
    setCached(cacheKey, payload, ttl),
    setPersistentCached(cacheKey, payload, ttl),
  ])

  return payload
}

async function fetchFixtureById(event: H3Event, fixture: number) {
  const fixtures = await cachedFootballApiGet<ApiSportsFixtureItem>(
    event,
    '/fixtures',
    { id: fixture },
    { cacheProfile: 'reference', cacheKeySuffix: 'reference-fixture' },
  )

  const mappedFixture = fixtures.response?.[0]
    ? mapFixture(fixtures.response[0])
    : null

  return mappedFixture
}

async function getFixtureCoverageContext(
  event: H3Event,
  fixture: FootballFixture | null,
) {
  const coverage = {
    injuries: false,
    predictions: false,
    odds: false,
  }

  if (!fixture) {
    return coverage
  }

  const leagues = await cachedFootballApiGet<ApiSportsLeagueItem>(
    event,
    '/leagues',
    {
      id: fixture.league.id,
      season: fixture.league.season,
    },
    { cacheProfile: 'reference', cacheKeySuffix: 'reference-league-coverage' },
  )

  const league = leagues.response?.[0]
  const season = league?.seasons?.find(
    (item) => item.year === fixture.league.season,
  )
  const seasonCoverage = season?.coverage

  if (!seasonCoverage) {
    return coverage
  }

  return {
    injuries: !!seasonCoverage.injuries,
    predictions: !!seasonCoverage.predictions,
    odds: !!seasonCoverage.odds,
  }
}

export async function fetchFixtureInjuries(
  event: H3Event,
  fixture: number,
  covered = true,
) {
  if (!covered) {
    return {
      ...toCoverageIndicator(false, false),
      injuries: [] as FootballFixtureAvailabilityPlayer[],
      suspensions: [] as FootballFixtureAvailabilityPlayer[],
    }
  }

  const payload = await cachedFootballApiGet<ApiSportsFixtureInjuryItem>(
    event,
    '/injuries',
    { fixture },
    { cacheProfile: 'reference', cacheKeySuffix: 'reference-fixture-injuries' },
  )
  const injuries = (payload.response ?? []).map(mapFixtureAvailabilityPlayer)

  return {
    ...toCoverageIndicator(true, injuries.length > 0),
    injuries,
    suspensions: [],
  }
}

export async function fetchFixturePrediction(
  event: H3Event,
  fixture: number,
  covered = true,
) {
  if (!covered) {
    return {
      ...toCoverageIndicator(false, false),
      item: null as ApiObject | null,
    }
  }

  const payload = await cachedFootballApiGet<ApiSportsFixturePredictionItem>(
    event,
    '/predictions',
    { fixture },
    {
      cacheProfile: 'reference',
      cacheKeySuffix: 'reference-fixture-predictions',
    },
  )
  const item = (payload.response?.[0] as ApiObject) ?? null

  return {
    ...toCoverageIndicator(true, !!item),
    item,
  }
}

export async function fetchFixtureHeadToHead(event: H3Event, h2h: string) {
  const payload = await cachedFootballApiGet<ApiSportsFixtureItem>(
    event,
    '/fixtures/headtohead',
    { h2h },
    {
      cacheProfile: 'reference',
      cacheKeySuffix: 'reference-fixture-headtohead',
    },
  )
  const fixtures = (payload.response ?? []).map(mapFixture)

  return {
    ...toCoverageIndicator(true, fixtures.length > 0),
    fixtures,
  }
}

export async function fetchFixtureLiveOdds(
  event: H3Event,
  fixture: number,
  covered = true,
) {
  if (!covered) {
    return {
      ...toCoverageIndicator(false, false),
      item: null as ApiObject | null,
    }
  }

  const payload = await cachedFootballApiGet<ApiSportsOddsItem>(
    event,
    '/odds/live',
    {},
    { cacheProfile: 'live', cacheKeySuffix: 'live-odds-live' },
  )
  const item =
    ((payload.response ?? []).find(
      (entry) => Number((entry as ApiObject)?.fixture?.id) === fixture,
    ) as ApiObject | undefined) ?? null

  return {
    ...toCoverageIndicator(true, !!item),
    item,
  }
}

export async function fetchFixtureMatchContext(
  event: H3Event,
  fixtureData: FootballFixture | null,
  fixtureId: number,
): Promise<FootballFixtureMatchContext> {
  const coverage = await getFixtureCoverageContext(event, fixtureData)
  const homeId = fixtureData?.teams.home.id
  const awayId = fixtureData?.teams.away.id
  const h2h =
    typeof homeId === 'number' && typeof awayId === 'number'
      ? `${homeId}-${awayId}`
      : null

  const [availability, prediction, liveOdds, headToHead] = await Promise.all([
    fetchFixtureInjuries(event, fixtureId, coverage.injuries),
    fetchFixturePrediction(event, fixtureId, coverage.predictions),
    fetchFixtureLiveOdds(event, fixtureId, coverage.odds),
    h2h
      ? fetchFixtureHeadToHead(event, h2h)
      : Promise.resolve({
          ...toCoverageIndicator(true, false),
          fixtures: [],
        }),
  ])

  return {
    coverage,
    availability,
    headToHead,
    prediction,
    liveOdds,
  }
}

export async function fetchFixtureDetails(
  event: H3Event,
  fixture: number,
): Promise<FootballFixtureDetailsApiResponse> {
  const [mappedFixture, events, lineups, players, statistics] =
    await Promise.all([
      fetchFixtureById(event, fixture),
      cachedFootballApiGet<ApiSportsFixtureEventItem>(
        event,
        '/fixtures/events',
        { fixture },
        {
          cacheProfile: 'reference',
          cacheKeySuffix: 'reference-fixture-events',
        },
      ),
      cachedFootballApiGet<ApiSportsLineupItem>(
        event,
        '/fixtures/lineups',
        { fixture },
        {
          cacheProfile: 'reference',
          cacheKeySuffix: 'reference-fixture-lineups',
        },
      ),
      cachedFootballApiGet<ApiSportsPlayerStatsItem>(
        event,
        '/fixtures/players',
        { fixture },
        {
          cacheProfile: 'reference',
          cacheKeySuffix: 'reference-fixture-players',
        },
      ),
      cachedFootballApiGet<ApiSportsFixtureStatisticsItem>(
        event,
        '/fixtures/statistics',
        { fixture },
        {
          cacheProfile: 'reference',
          cacheKeySuffix: 'reference-fixture-statistics',
        },
      ),
    ])
  const matchContext = await fetchFixtureMatchContext(
    event,
    mappedFixture,
    fixture,
  )

  return {
    fixture: mappedFixture,
    events: (events.response ?? []).map(mapEvent),
    lineups: (lineups.response ?? []).map(mapLineup),
    playerStats: (players.response ?? []).flatMap(mapPlayerStats),
    teamStatistics: mapFixtureStatistics(mappedFixture, statistics.response),
    matchContext,
  }
}

export async function cachedFixtureDetails(
  event: H3Event,
  fixture: number,
): Promise<FootballFixtureDetailsApiResponse> {
  const cacheKey = publicCacheKey('/sports/football/fixture:reference', {
    fixture,
  })
  const ttl = resolveCacheTtl('football', 'reference')
  const redisCached =
    await getCached<FootballFixtureDetailsApiResponse>(cacheKey)

  if (redisCached) {
    return redisCached
  }

  const persistentCached =
    await getPersistentCached<FootballFixtureDetailsApiResponse>(cacheKey)
  if (persistentCached) {
    await setCached(cacheKey, persistentCached, ttl)
    return persistentCached
  }

  const payload = await fetchFixtureDetails(event, fixture)
  await Promise.all([
    setCached(cacheKey, payload, ttl),
    setPersistentCached(cacheKey, payload, ttl),
  ])

  return payload
}
