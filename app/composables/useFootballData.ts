export type SectionState = 'loading' | 'error' | 'empty' | 'ready'
export type FootballSectionKey =
  | 'leagues'
  | 'fixtures'
  | 'standings'
  | 'teams'
  | 'fixtureDetails'
  | 'teamDetails'
  | 'playerDetails'

export interface FootballSection {
  key: FootballSectionKey
  title: string
  state: SectionState
  error: string
  emptyMessage: string
}

export interface FootballLeagueSeason {
  year: number
  current: boolean
}

export interface FootballLeague {
  id: number
  name: string
  country: {
    name: string
  }
  seasons: FootballLeagueSeason[]
}

export interface FootballFixtureOdds {
  home: string | null
  draw: string | null
  away: string | null
  bookmaker: string | null
}

export interface FootballFixture {
  id: number
  date: string
  status?: {
    short?: string
    long?: string
    elapsed?: number | null
  }
  teams: {
    home: { id?: number | null; name: string; logo?: string | null }
    away: { id?: number | null; name: string; logo?: string | null }
  }
  goals?: {
    home: number | null
    away: number | null
  }
  odds?: FootballFixtureOdds | null
}

export interface FootballTeam {
  id: number
  name: string
  logo?: string | null
}

export interface FootballStandingRow {
  rank: number
  points: number
  goalsDiff: number
  group: string | null
  form: string | null
  status: string | null
  description: string | null
  team: { id: number; name: string; logo?: string | null }
  all: {
    played: number
    win: number
    draw: number
    lose: number
    goals: {
      for: number
      against: number
    }
  }
}

export interface FootballStandingsGroup {
  name: string
  rows: FootballStandingRow[]
}

export interface FootballStandingsLeague {
  id: number
  name: string
  country: string
  logo: string | null
  flag: string | null
  season: number
}

export type FixtureTeamStatsMetricKey =
  | 'xg'
  | 'possession'
  | 'shotsTotal'
  | 'shotsOnTarget'
  | 'bigChances'
  | 'passes'
  | 'corners'
  | 'cards'

export interface FixtureTeamStatsPeriod {
  home?: Partial<Record<FixtureTeamStatsMetricKey, string | number | null>>
  away?: Partial<Record<FixtureTeamStatsMetricKey, string | number | null>>
}

export interface FixtureTeamStatistics {
  match: FixtureTeamStatsPeriod
  firstHalf?: FixtureTeamStatsPeriod
  secondHalf?: FixtureTeamStatsPeriod
}

export interface FootballFixtureDetails {
  fixture: FootballFixture | null
  events: Array<{
    time: { elapsed: number | null }
    team: { name: string | null }
    player: { name: string | null }
    type: string
    detail?: string | null
    comments?: string | null
  }>
  lineups: Array<{
    team?: {
      id?: number | null
      name?: string | null
      logo?: string | null
    }
    coach?: {
      name?: string | null
    }
    formation?: string | null
    startXI?: Array<{
      id?: number | null
      name?: string | null
      number?: number | null
      pos?: string | null
      grid?: string | null
    }>
    substitutes?: Array<{
      id?: number | null
      name?: string | null
      number?: number | null
      pos?: string | null
      grid?: string | null
    }>
  }>
  playerStats: Array<{
    team?: {
      id?: number | null
      name?: string | null
      logo?: string | null
    }
    player?: {
      id?: number | null
      name?: string | null
      photo?: string | null
    }
    statistics?: Array<Record<string, any>>
  }>
  teamStatistics: FixtureTeamStatistics
}

export interface FixtureEventViewModel {
  id: string
  minute: number
  timeLabel: string
  teamId: number | null
  teamName: string
  playerId: number | null
  playerName: string
  detail: string
  comment: string
  icon: string
  color: string
}

export interface FixtureLineupPlayerViewModel {
  id: number | null
  name: string
  number: string
  position: string
  grid: string
}

export interface FixtureLineupViewModel {
  teamId: number | null
  teamName: string
  teamLogo: string | null
  formation: string
  coachName: string
  starters: FixtureLineupPlayerViewModel[]
  substitutes: FixtureLineupPlayerViewModel[]
}

export interface FixturePlayerStatViewModel {
  id: string
  playerId: number | null
  playerPhoto: string | null
  teamId: number | null
  teamName: string
  playerName: string
  position: string
  rating: string
  minutes: string
  goals: string
  assists: string
  shots: string
  passes: string
  tackles: string
  metrics: Record<string, string | number | null>
}

export interface FootballTeamDetails {
  statistics: {
    team: FootballTeam
    league: {
      name: string
      season: number
    }
    form: string | null
    fixtures: Record<string, any>
    goals: Record<string, any>
    cleanSheet: Record<string, any>
    failedToScore: Record<string, any>
    lineups: Array<{ formation?: string; played?: number }>
  }
  squad: {
    players: Array<{
      id: number
      name: string
      age: number | null
      number: number | null
      position: string | null
      photo: string | null
    }>
  }
}

export interface FootballPlayerDetails {
  profile: {
    id: number
    name: string
    firstname: string | null
    lastname: string | null
    age: number | null
    nationality: string | null
    photo: string | null
    height: string | null
    weight: string | null
  } | null
  statistics: Array<Record<string, any>>
}

function normalizePlayerStatistics(
  stats: Array<Record<string, any>> | undefined,
) {
  if (!Array.isArray(stats)) {
    return []
  }

  return stats.map((stat) => {
    const games =
      stat?.games && typeof stat.games === 'object'
        ? {
            ...stat.games,
            appearances:
              stat.games.appearances ?? stat.games.appearences ?? null,
          }
        : stat.games

    return {
      ...stat,
      games,
    }
  })
}

function toErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'statusMessage' in error) {
    const statusMessage = (error as { statusMessage?: unknown }).statusMessage

    if (typeof statusMessage === 'string' && statusMessage.length > 0) {
      return statusMessage
    }
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message

    if (typeof message === 'string' && message.length > 0) {
      return message
    }
  }

  return fallback
}

function normalizeSelectionId(value: number | string | null | undefined) {
  if (value === null || typeof value === 'undefined' || value === '') {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function toStatLabel(value: unknown) {
  const numeric = toNumber(value)
  if (numeric !== null) {
    return `${numeric}`
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return value
  }

  return '-'
}

function normalizeMetricKey(key: string) {
  const trimmed = key.trim()
  if (!trimmed) return trimmed

  const aliasMap: Record<string, string> = {
    appearences: 'appearances',
    key_passes: 'keyPasses',
    keypasses: 'keyPasses',
    totalpasses: 'totalPasses',
  }

  const normalizedLookupKey = trimmed.toLowerCase().replace(/[\s_-]/g, '')
  const mapped = aliasMap[normalizedLookupKey]
  if (mapped) return mapped

  if (trimmed.includes('_')) {
    const [first, ...rest] = trimmed.split('_')
    return `${first}${rest.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')}`
  }

  return trimmed
}

function normalizePlayerStatRecord(
  value: unknown,
): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const normalized: Record<string, unknown> = {}

  Object.entries(value).forEach(([key, entry]) => {
    const normalizedKey = normalizeMetricKey(key)
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      normalized[normalizedKey] = normalizePlayerStatRecord(entry) ?? entry
      return
    }
    normalized[normalizedKey] = entry as string | number | null | boolean
  })

  return normalized
}

function flattenPlayerMetrics(
  value: Record<string, unknown>,
  parentKey = '',
): Record<string, string | number | null> {
  const output: Record<string, string | number | null> = {}

  Object.entries(value).forEach(([key, entry]) => {
    const path = parentKey ? `${parentKey}.${key}` : key

    if (entry === null || typeof entry === 'undefined') {
      output[path] = null
      return
    }

    if (typeof entry === 'object' && !Array.isArray(entry)) {
      Object.assign(
        output,
        flattenPlayerMetrics(entry as Record<string, unknown>, path),
      )
      return
    }

    if (typeof entry === 'number' || typeof entry === 'string') {
      output[path] = entry
      return
    }

    output[path] = `${entry}`
  })

  return output
}

function mapFixtureEventIcon(type: string, detail: string) {
  const normalizedType = type.toLowerCase()
  const normalizedDetail = detail.toLowerCase()

  if (normalizedType.includes('goal')) {
    return { icon: 'mdi-soccer', color: 'success' }
  }

  if (normalizedDetail.includes('yellow')) {
    return { icon: 'mdi-card', color: 'warning' }
  }

  if (normalizedDetail.includes('red')) {
    return { icon: 'mdi-card-bulleted', color: 'error' }
  }

  if (normalizedType.includes('subst')) {
    return { icon: 'mdi-swap-horizontal', color: 'info' }
  }

  if (normalizedType.includes('var')) {
    return { icon: 'mdi-video-outline', color: 'secondary' }
  }

  return { icon: 'mdi-whistle', color: 'primary' }
}

function mapFixtureEvents(
  events: FootballFixtureDetails['events'],
  t: (key: string, params?: Record<string, unknown>) => string,
) {
  return [...events]
    .map((event, index): FixtureEventViewModel => {
      const minute = event.time?.elapsed ?? 0
      const detail =
        event.detail ??
        event.type ??
        t('pages.applications.football.misc.event')
      const iconConfig = mapFixtureEventIcon(event.type ?? '', detail)

      return {
        id: `${minute}-${event.player?.name ?? 'player'}-${index}`,
        minute,
        timeLabel: minute > 0 ? `${minute}'` : "0'",
        teamId: event.team?.id ?? null,
        teamName:
          event.team?.name ?? t('pages.applications.football.misc.unknownTeam'),
        playerId: event.player?.id ?? null,
        playerName:
          event.player?.name ??
          t('pages.applications.football.misc.unknownPlayer'),
        detail,
        comment: event.comments ?? '',
        icon: iconConfig.icon,
        color: iconConfig.color,
      }
    })
    .sort((left, right) => left.minute - right.minute)
}

function mapFixtureLineups(
  lineups: FootballFixtureDetails['lineups'],
  t: (key: string, params?: Record<string, unknown>) => string,
) {
  return lineups.map((lineup): FixtureLineupViewModel => {
    const toPlayer = (
      player: NonNullable<typeof lineup.startXI>[number],
    ): FixtureLineupPlayerViewModel => ({
      id: player?.id ?? null,
      name: player?.name ?? t('pages.applications.football.misc.unknownPlayer'),
      number: player?.number ? `${player.number}` : '-',
      position: player?.pos ?? '-',
      grid: player?.grid ?? '',
    })

    return {
      teamId: lineup.team?.id ?? null,
      teamName:
        lineup.team?.name ?? t('pages.applications.football.misc.unknownTeam'),
      teamLogo: lineup.team?.logo ?? null,
      formation: lineup.formation ?? '-',
      coachName: lineup.coach?.name ?? '-',
      starters: (lineup.startXI ?? []).map(toPlayer),
      substitutes: (lineup.substitutes ?? []).map(toPlayer),
    }
  })
}

function mapFixturePlayerStats(
  stats: FootballFixtureDetails['playerStats'],
  t: (key: string, params?: Record<string, unknown>) => string,
): FixturePlayerStatViewModel[] {
  return stats.map((entry, index) => {
    const details = normalizePlayerStatRecord(entry.statistics?.[0] ?? {}) ?? {}
    const metrics = flattenPlayerMetrics(details)
    const games = (details.games as Record<string, unknown> | undefined) ?? {}
    const goals = (details.goals as Record<string, unknown> | undefined) ?? {}
    const shots = (details.shots as Record<string, unknown> | undefined) ?? {}
    const passes =
      (details.passes as Record<string, unknown> | undefined) ?? {}
    const tackles =
      (details.tackles as Record<string, unknown> | undefined) ?? {}

    return {
      id: `${entry.team?.id ?? 'team'}-${entry.player?.id ?? index}`,
      playerId: entry.player?.id ?? null,
      playerPhoto: entry.player?.photo ?? null,
      teamId: entry.team?.id ?? null,
      teamName:
        entry.team?.name ?? t('pages.applications.football.misc.unknownTeam'),
      playerName:
        entry.player?.name ??
        t('pages.applications.football.misc.unknownPlayer'),
      position: toStatLabel(games?.position),
      rating: toStatLabel(games?.rating),
      minutes: toStatLabel(games?.minutes),
      goals: toStatLabel(goals?.total),
      assists: toStatLabel(goals?.assists),
      shots: toStatLabel(shots?.total),
      passes: toStatLabel(passes?.total),
      tackles: toStatLabel(tackles?.total),
      metrics,
    }
  })
}

function toOddLabel(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toFixed(2)
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return value
  }

  return null
}

function mapFootballOddsByFixture(items: Array<Record<string, any>>) {
  const map = new Map<number, FootballFixtureOdds>()

  for (const item of items) {
    const fixtureId = Number(item?.fixture?.id)
    if (!Number.isInteger(fixtureId) || fixtureId <= 0 || map.has(fixtureId)) {
      continue
    }

    const bookmaker = Array.isArray(item?.bookmakers)
      ? item.bookmakers[0]
      : null
    const matchWinner = Array.isArray(bookmaker?.bets)
      ? bookmaker.bets.find((bet: Record<string, any>) => {
          const name = `${bet?.name ?? ''}`.toLowerCase()
          return (
            name.includes('match winner') ||
            name.includes('winner') ||
            name.includes('result')
          )
        })
      : null

    const values = Array.isArray(matchWinner?.values) ? matchWinner.values : []
    const findOdd = (labels: string[]) => {
      const candidate = values.find((entry: Record<string, any>) => {
        const value = `${entry?.value ?? ''}`.toLowerCase()
        return labels.some((label) => value === label)
      })
      return toOddLabel(candidate?.odd)
    }

    map.set(fixtureId, {
      home: findOdd(['home', '1']),
      draw: findOdd(['draw', 'x']),
      away: findOdd(['away', '2']),
      bookmaker: typeof bookmaker?.name === 'string' ? bookmaker.name : null,
    })
  }

  return map
}

export function useFootballData() {
  const { t } = useI18n()
  const leagues = ref<FootballLeague[]>([])
  const fixtures = ref<FootballFixture[]>([])
  const standings = ref<FootballStandingsGroup[]>([])
  const standingsLeague = ref<FootballStandingsLeague | null>(null)
  const teams = ref<FootballTeam[]>([])
  const fixtureDetails = ref<FootballFixtureDetails | null>(null)
  const teamDetails = ref<FootballTeamDetails | null>(null)
  const playerDetails = ref<FootballPlayerDetails | null>(null)

  const selectedLeagueId = ref<number | null>(null)
  const selectedSeason = ref<number | null>(null)
  const selectedFixtureId = ref<number | null>(null)
  const selectedTeamId = ref<number | null>(null)
  const selectedPlayerId = ref<number | null>(null)

  const leaguesState = ref<SectionState>('loading')
  const fixturesState = ref<SectionState>('empty')
  const standingsState = ref<SectionState>('empty')
  const teamsState = ref<SectionState>('empty')
  const fixtureDetailsState = ref<SectionState>('empty')
  const teamDetailsState = ref<SectionState>('empty')
  const playerDetailsState = ref<SectionState>('empty')

  const leaguesError = ref('')
  const fixturesError = ref('')
  const standingsError = ref('')
  const teamsError = ref('')
  const fixtureDetailsError = ref('')
  const teamDetailsError = ref('')
  const playerDetailsError = ref('')

  const selectedLeague = computed<FootballLeague | null>(() => {
    if (!selectedLeagueId.value) return null
    return (
      leagues.value.find((league) => league.id === selectedLeagueId.value) ||
      null
    )
  })

  const seasons = computed<number[]>(() => {
    if (!selectedLeague.value) return []

    return [...selectedLeague.value.seasons]
      .map((season) => season.year)
      .sort((left, right) => right - left)
  })

  const footballSections = computed<FootballSection[]>(() => {
    return [
      {
        key: 'leagues',
        title: t('pages.applications.football.sections.leagues.title'),
        state: leaguesState.value,
        error: leaguesError.value,
        emptyMessage: t('pages.applications.football.sections.leagues.empty'),
      },
      {
        key: 'fixtures',
        title: t('pages.applications.football.sections.fixtures.title'),
        state: fixturesState.value,
        error: fixturesError.value,
        emptyMessage: t('pages.applications.football.sections.fixtures.empty'),
      },
      {
        key: 'standings',
        title: t('pages.applications.football.sections.standings.title'),
        state: standingsState.value,
        error: standingsError.value,
        emptyMessage: t('pages.applications.football.sections.standings.empty'),
      },
      {
        key: 'teams',
        title: t('pages.applications.football.sections.teams.title'),
        state: teamsState.value,
        error: teamsError.value,
        emptyMessage: t('pages.applications.football.sections.teams.empty'),
      },
      {
        key: 'fixtureDetails',
        title: t('pages.applications.football.sections.fixtureDetails.title'),
        state: fixtureDetailsState.value,
        error: fixtureDetailsError.value,
        emptyMessage: t(
          'pages.applications.football.sections.fixtureDetails.empty',
        ),
      },
      {
        key: 'teamDetails',
        title: t('pages.applications.football.sections.teamDetails.title'),
        state: teamDetailsState.value,
        error: teamDetailsError.value,
        emptyMessage: t(
          'pages.applications.football.sections.teamDetails.empty',
        ),
      },
      {
        key: 'playerDetails',
        title: t('pages.applications.football.sections.playerDetails.title'),
        state: playerDetailsState.value,
        error: playerDetailsError.value,
        emptyMessage: t(
          'pages.applications.football.sections.playerDetails.empty',
        ),
      },
    ]
  })

  const mappedFixtureEvents = computed<FixtureEventViewModel[]>(() => {
    return mapFixtureEvents(fixtureDetails.value?.events ?? [], t)
  })

  const mappedFixtureLineups = computed<FixtureLineupViewModel[]>(() => {
    return mapFixtureLineups(fixtureDetails.value?.lineups ?? [], t)
  })

  const mappedFixturePlayerStats = computed<FixturePlayerStatViewModel[]>(
    () => {
      return mapFixturePlayerStats(fixtureDetails.value?.playerStats ?? [], t)
    },
  )

  const mappedFixtureTeamStatistics = computed<FixtureTeamStatistics>(() => {
    return (
      fixtureDetails.value?.teamStatistics ?? {
        match: {
          home: {},
          away: {},
        },
      }
    )
  })

  const resetLeagueDependentData = () => {
    fixtures.value = []
    standings.value = []
    standingsLeague.value = null
    teams.value = []
    fixtureDetails.value = null
    teamDetails.value = null
    playerDetails.value = null
    selectedFixtureId.value = null
    selectedTeamId.value = null
    selectedPlayerId.value = null
    fixturesError.value = ''
    standingsError.value = ''
    teamsError.value = ''
    fixtureDetailsError.value = ''
    teamDetailsError.value = ''
    playerDetailsError.value = ''
    fixturesState.value = 'empty'
    standingsState.value = 'empty'
    teamsState.value = 'empty'
    fixtureDetailsState.value = 'empty'
    teamDetailsState.value = 'empty'
    playerDetailsState.value = 'empty'
  }

  const loadLeagues = async () => {
    leaguesState.value = 'loading'
    leaguesError.value = ''

    try {
      const response = await $fetch<{ items: FootballLeague[] }>(
        '/api/sports/football/leagues',
      )
      leagues.value = response.items
      leaguesState.value = leagues.value.length ? 'ready' : 'empty'

      if (leagues.value.length && !selectedLeagueId.value) {
        const firstLeague = leagues.value[0] as FootballLeague
        selectedLeagueId.value = firstLeague.id
        const currentSeason = firstLeague.seasons.find(
          (season) => season.current,
        )
        selectedSeason.value = currentSeason?.year || seasons.value[0] || null
      }
    } catch (error) {
      leagues.value = []
      leaguesState.value = 'error'
      leaguesError.value = toErrorMessage(
        error,
        t('pages.applications.football.errors.loadLeagues'),
      )
      resetLeagueDependentData()
    }
  }

  const loadLeagueSeasonData = async () => {
    if (!selectedLeagueId.value || !selectedSeason.value) {
      resetLeagueDependentData()
      return
    }

    fixturesState.value = 'loading'
    standingsState.value = 'loading'
    teamsState.value = 'loading'
    fixtureDetails.value = null
    selectedFixtureId.value = null
    selectedTeamId.value = null
    selectedPlayerId.value = null
    teamDetails.value = null
    playerDetails.value = null
    fixtureDetailsError.value = ''
    teamDetailsError.value = ''
    playerDetailsError.value = ''
    fixtureDetailsState.value = 'empty'
    teamDetailsState.value = 'empty'
    playerDetailsState.value = 'empty'

    const league = selectedLeagueId.value
    const season = selectedSeason.value

    const [fixturesResult, standingsResult, teamsResult, oddsResult] =
      await Promise.allSettled([
        $fetch<{ items: FootballFixture[] }>('/api/sports/football/fixtures', {
          query: { league, season },
        }),
        $fetch<{
          league: FootballStandingsLeague
          groups: FootballStandingsGroup[]
        }>('/api/sports/football/standings', {
          query: { league, season },
        }),
        $fetch<{ items: FootballTeam[] }>('/api/sports/football/teams', {
          query: { league, season },
        }),
        $fetch<{ items: Array<Record<string, any>> }>(
          '/api/sports/football/odds',
          {
            query: { league, season },
          },
        ),
      ])

    if (fixturesResult.status === 'fulfilled') {
      const oddsByFixture =
        oddsResult.status === 'fulfilled'
          ? mapFootballOddsByFixture(oddsResult.value.items)
          : new Map<number, FootballFixtureOdds>()

      fixtures.value = fixturesResult.value.items.map((fixture) => ({
        ...fixture,
        odds: oddsByFixture.get(fixture.id) ?? null,
      }))
      fixturesState.value = fixtures.value.length ? 'ready' : 'empty'
      fixturesError.value = ''
    } else {
      fixtures.value = []
      fixturesState.value = 'error'
      fixturesError.value = toErrorMessage(
        fixturesResult.reason,
        t('pages.applications.football.errors.loadFixtures'),
      )
    }

    if (standingsResult.status === 'fulfilled') {
      standings.value = standingsResult.value.groups
      standingsLeague.value = standingsResult.value.league
      standingsState.value = standings.value.length ? 'ready' : 'empty'
      standingsError.value = ''
    } else {
      standings.value = []
      standingsLeague.value = null
      standingsState.value = 'error'
      standingsError.value = toErrorMessage(
        standingsResult.reason,
        t('pages.applications.football.errors.loadStandings'),
      )
    }

    if (teamsResult.status === 'fulfilled') {
      teams.value = teamsResult.value.items
      teamsState.value = teams.value.length ? 'ready' : 'empty'
      teamsError.value = ''
    } else {
      teams.value = []
      teamsState.value = 'error'
      teamsError.value = toErrorMessage(
        teamsResult.reason,
        t('pages.applications.football.errors.loadTeams'),
      )
    }
  }

  const selectLeague = (leagueId: number | string | null) => {
    selectedLeagueId.value = normalizeSelectionId(leagueId)

    if (!selectedLeague.value) {
      selectedSeason.value = null
      resetLeagueDependentData()
      return
    }

    const preferredSeason = selectedLeague.value.seasons.find(
      (season) => season.current,
    )?.year
    selectedSeason.value = preferredSeason || seasons.value[0] || null
  }

  const selectSeason = (season: number | string | null) => {
    selectedSeason.value = normalizeSelectionId(season)
  }

  const loadFixtureDetails = async (fixtureId: number | null) => {
    selectedFixtureId.value = fixtureId
    fixtureDetails.value = null
    fixtureDetailsError.value = ''

    if (!fixtureId) {
      fixtureDetailsState.value = 'empty'
      return
    }

    fixtureDetailsState.value = 'loading'

    try {
      const response = await $fetch<FootballFixtureDetails>(
        '/api/sports/football/fixture',
        {
          query: { fixture: fixtureId },
        },
      )

      fixtureDetails.value = response
      const hasContent =
        !!response.fixture ||
        response.events.length > 0 ||
        response.lineups.length > 0 ||
        response.playerStats.length > 0

      fixtureDetailsState.value = hasContent ? 'ready' : 'empty'
    } catch (error) {
      fixtureDetailsState.value = 'error'
      fixtureDetailsError.value = toErrorMessage(
        error,
        t('pages.applications.football.errors.loadFixtureDetails'),
      )
    }
  }

  const loadTeamDetails = async (teamId: number | null) => {
    selectedTeamId.value = teamId
    teamDetails.value = null
    teamDetailsError.value = ''
    selectedPlayerId.value = null
    playerDetails.value = null
    playerDetailsError.value = ''
    playerDetailsState.value = 'empty'

    if (!teamId || !selectedLeagueId.value || !selectedSeason.value) {
      teamDetailsState.value = 'empty'
      return
    }

    teamDetailsState.value = 'loading'

    try {
      const response = await $fetch<FootballTeamDetails>(
        '/api/sports/football/team',
        {
          query: {
            team: teamId,
            league: selectedLeagueId.value,
            season: selectedSeason.value,
          },
        },
      )

      teamDetails.value = response
      const hasStatistics = !!response?.statistics?.team?.id
      const hasPlayers = response?.squad?.players?.length > 0
      teamDetailsState.value = hasStatistics || hasPlayers ? 'ready' : 'empty'
    } catch (error) {
      teamDetailsState.value = 'error'
      teamDetailsError.value = toErrorMessage(
        error,
        t('pages.applications.football.errors.loadTeamDetails'),
      )
    }
  }

  const loadPlayerDetails = async (playerId: number | null) => {
    selectedPlayerId.value = playerId
    playerDetails.value = null
    playerDetailsError.value = ''

    if (!playerId || !selectedSeason.value) {
      playerDetailsState.value = 'empty'
      return
    }

    playerDetailsState.value = 'loading'

    try {
      const response = await $fetch<FootballPlayerDetails>(
        '/api/sports/football/player',
        {
          query: {
            player: playerId,
            season: selectedSeason.value,
            ...(selectedLeagueId.value
              ? { league: selectedLeagueId.value }
              : {}),
            ...(selectedTeamId.value ? { team: selectedTeamId.value } : {}),
          },
        },
      )

      playerDetails.value = {
        ...response,
        statistics: normalizePlayerStatistics(response.statistics),
      }
      playerDetailsState.value = response.profile ? 'ready' : 'empty'
    } catch (error) {
      playerDetailsState.value = 'error'
      playerDetailsError.value = toErrorMessage(
        error,
        t('pages.applications.football.errors.loadPlayerDetails'),
      )
    }
  }

  return {
    leagues,
    fixtures,
    standings,
    standingsLeague,
    teams,
    fixtureDetails,
    mappedFixtureEvents,
    mappedFixtureLineups,
    mappedFixturePlayerStats,
    mappedFixtureTeamStatistics,
    teamDetails,
    playerDetails,
    footballSections,
    selectedLeague,
    seasons,
    selectedLeagueId,
    selectedSeason,
    selectedFixtureId,
    selectedTeamId,
    selectedPlayerId,
    leaguesState,
    fixturesState,
    standingsState,
    teamsState,
    fixtureDetailsState,
    teamDetailsState,
    playerDetailsState,
    leaguesError,
    fixturesError,
    standingsError,
    teamsError,
    fixtureDetailsError,
    teamDetailsError,
    playerDetailsError,
    loadLeagues,
    loadLeagueSeasonData,
    loadFixtureDetails,
    loadTeamDetails,
    loadPlayerDetails,
    selectLeague,
    selectSeason,
  }
}
