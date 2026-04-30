export type BasketballSectionState = 'loading' | 'error' | 'empty' | 'ready'

export interface BasketballLeague {
  id: number
  name: string
  country: {
    name: string
  }
  seasons: Array<{
    season: number
    start: string | null
    end: string | null
    coverage: {
      games: {
        statistics: {
          teams: boolean
          players: boolean
        }
      }
      standings: boolean
      players: boolean
      odds: boolean
    }
  }>
}

export interface BasketballTeam {
  id: number
  name: string
  logo?: string | null
}

export interface BasketballGame {
  id: number
  date: string | null
  status?: {
    short?: string | null
    long?: string | null
    timer?: string | null
  }
  teams: {
    home: BasketballTeam
    away: BasketballTeam
  }
  scores?: Record<string, any>
}

export interface BasketballStandingRow {
  position: number
  team: BasketballTeam
  played: number
  win: {
    total: number
    percentage: string | null
  }
  lose: {
    total: number
    percentage: string | null
  }
  points: {
    for: number
    against: number
  }
  form: string | null
  topPlayerId?: number | null
  topPlayer?: {
    id?: number | null
    name?: string | null
    photo?: string | null
    position?: string | null
  } | null
}

export interface BasketballPlayerDetails {
  player: {
    id: number | null
    name: string
    firstname: string | null
    lastname: string | null
    age: number | null
    height: string | null
    weight: string | null
    nationality: string | null
    photo: string | null
    injured: boolean | null
  } | null
  team: {
    id: number | null
    name: string
    logo: string | null
  } | null
  statistics: Array<Record<string, any>>
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

const STANDINGS_UNAVAILABLE_MESSAGE =
  'Standings are not available for the selected league season.'

function isStandingsUnavailableError(error: unknown) {
  const message = toErrorMessage(error, '').toLowerCase()

  if (!message) {
    return false
  }

  return (
    (message.includes('standings') &&
      (message.includes('not available') || message.includes('unavailable'))) ||
    message.includes('source_without_standings')
  )
}

export function useBasketballData() {
  const leagues = ref<BasketballLeague[]>([])
  const games = ref<BasketballGame[]>([])
  const standings = ref<BasketballStandingRow[]>([])

  const leaguesState = ref<BasketballSectionState>('loading')
  const gamesState = ref<BasketballSectionState>('empty')
  const standingsState = ref<BasketballSectionState>('empty')

  const leaguesError = ref('')
  const gamesError = ref('')
  const standingsError = ref('')
  const playerError = ref('')

  const selectedLeagueId = ref<number | null>(null)
  const selectedSeason = ref<number | null>(null)
  const selectedGameId = ref<number | null>(null)
  const selectedPlayerId = ref<number | null>(null)
  const playerDetails = ref<BasketballPlayerDetails | null>(null)
  const playerState = ref<BasketballSectionState>('empty')

  const selectedLeague = computed<BasketballLeague | null>(() => {
    if (!selectedLeagueId.value) return null
    return (
      leagues.value.find((league) => league.id === selectedLeagueId.value) ??
      null
    )
  })

  const seasons = computed<number[]>(() => {
    if (!selectedLeague.value) return []
    return [...selectedLeague.value.seasons]
      .map((entry) => entry.season)
      .filter((season) => Number.isInteger(season) && season > 0)
      .sort((left, right) => right - left)
  })

  const resetLeagueData = () => {
    games.value = []
    standings.value = []
    selectedGameId.value = null
    selectedPlayerId.value = null
    playerDetails.value = null
    gamesState.value = 'empty'
    standingsState.value = 'empty'
    playerState.value = 'empty'
    gamesError.value = ''
    standingsError.value = ''
    playerError.value = ''
  }

  const loadLeagues = async () => {
    leaguesState.value = 'loading'
    leaguesError.value = ''

    try {
      const response = await $fetch<{ items: BasketballLeague[] }>(
        '/api/sports/basketball/leagues',
      )
      leagues.value = response.items
      leaguesState.value = leagues.value.length ? 'ready' : 'empty'

      if (leagues.value.length && !selectedLeagueId.value) {
        selectedLeagueId.value = leagues.value[0]?.id ?? null
        selectedSeason.value = seasons.value[0] ?? null
      }
    } catch (error) {
      leagues.value = []
      leaguesState.value = 'error'
      leaguesError.value = toErrorMessage(
        error,
        'Failed to load basketball leagues',
      )
      resetLeagueData()
    }
  }

  const loadLeagueSeasonData = async () => {
    if (!selectedLeagueId.value || !selectedSeason.value) {
      resetLeagueData()
      return
    }

    gamesState.value = 'loading'
    gamesError.value = ''
    standingsError.value = ''
    selectedPlayerId.value = null
    playerDetails.value = null
    playerState.value = 'empty'
    playerError.value = ''

    const league = selectedLeagueId.value
    const season = selectedSeason.value
    const seasonCoverage = selectedLeague.value?.seasons.find(
      (entry) => entry.season === season,
    )?.coverage
    const canLoadStandings = seasonCoverage?.standings === true

    standingsState.value = canLoadStandings ? 'loading' : 'empty'
    standings.value = []

    if (!canLoadStandings) {
      standingsError.value = STANDINGS_UNAVAILABLE_MESSAGE
    }

    const [gamesResult, standingsResult] = await Promise.allSettled([
      $fetch<{ items: BasketballGame[] }>('/api/sports/basketball/games', {
        query: { league, season },
      }),
      canLoadStandings
        ? $fetch<{
            groups: Array<{ rows: BasketballStandingRow[] }>
            meta?: {
              standingsAvailable?: boolean
              reason?: string | null
            }
          }>('/api/sports/basketball/standings', {
            query: { league, season },
          })
        : Promise.resolve(null),
    ])

    if (gamesResult.status === 'fulfilled') {
      games.value = gamesResult.value.items
      gamesState.value = games.value.length ? 'ready' : 'empty'
      if (!selectedGameId.value) {
        selectedGameId.value = games.value[0]?.id ?? null
      }
    } else {
      games.value = []
      gamesState.value = 'error'
      gamesError.value = toErrorMessage(
        gamesResult.reason,
        'Failed to load basketball games',
      )
    }

    if (!canLoadStandings) {
      standings.value = []
      standingsState.value = 'empty'
    } else if (standingsResult.status === 'fulfilled') {
      const standingsResponse = standingsResult.value
      if (!standingsResponse) {
        standings.value = []
        standingsState.value = 'empty'
        standingsError.value = STANDINGS_UNAVAILABLE_MESSAGE
        return
      }

      const standingsUnavailable =
        standingsResponse.meta?.standingsAvailable === false ||
        standingsResponse.meta?.reason === 'source_without_standings'

      if (standingsUnavailable) {
        standings.value = []
        standingsState.value = 'empty'
        standingsError.value = STANDINGS_UNAVAILABLE_MESSAGE
      } else {
        standings.value = standingsResponse.groups?.[0]?.rows ?? []
        standingsState.value = standings.value.length ? 'ready' : 'empty'
        standingsError.value = ''
      }
    } else {
      standings.value = []
      if (isStandingsUnavailableError(standingsResult.reason)) {
        standingsState.value = 'empty'
        standingsError.value = STANDINGS_UNAVAILABLE_MESSAGE
      } else {
        standingsState.value = 'error'
        standingsError.value = toErrorMessage(
          standingsResult.reason,
          'Failed to load basketball standings (server or network error)',
        )
      }
    }
  }

  const selectLeague = (leagueId: number | string | null) => {
    selectedLeagueId.value = normalizeSelectionId(leagueId)

    if (!selectedLeague.value) {
      selectedSeason.value = null
      resetLeagueData()
      return
    }

    selectedSeason.value = seasons.value[0] ?? null
  }

  const selectSeason = (season: string | number | null) => {
    selectedSeason.value = normalizeSelectionId(season)
  }

  const selectGame = (gameId: number | null) => {
    selectedGameId.value = gameId
  }

  const normalizePlayerDetails = (
    response: Record<string, any>,
  ): BasketballPlayerDetails => {
    const profile = response?.player ?? response?.profile ?? null
    const team = response?.team ?? response?.statistics?.[0]?.team ?? null
    const statistics = Array.isArray(response?.statistics)
      ? response.statistics
      : []

    return {
      player: profile
        ? {
            id: typeof profile.id === 'number' ? profile.id : null,
            name:
              (typeof profile.name === 'string' && profile.name.trim()) ||
              [profile.firstname, profile.lastname]
                .filter(
                  (part) => typeof part === 'string' && part.trim().length > 0,
                )
                .join(' ') ||
              'Unknown player',
            firstname:
              typeof profile.firstname === 'string' ? profile.firstname : null,
            lastname:
              typeof profile.lastname === 'string' ? profile.lastname : null,
            age: typeof profile.age === 'number' ? profile.age : null,
            height: typeof profile.height === 'string' ? profile.height : null,
            weight: typeof profile.weight === 'string' ? profile.weight : null,
            nationality:
              typeof profile.nationality === 'string'
                ? profile.nationality
                : null,
            photo: typeof profile.photo === 'string' ? profile.photo : null,
            injured:
              typeof profile.injured === 'boolean' ? profile.injured : null,
          }
        : null,
      team: team
        ? {
            id: typeof team.id === 'number' ? team.id : null,
            name:
              (typeof team.name === 'string' && team.name.trim()) ||
              'Unknown team',
            logo: typeof team.logo === 'string' ? team.logo : null,
          }
        : null,
      statistics,
    }
  }

  const loadPlayerDetails = async (
    playerId: number | null,
    season?: number | null,
  ) => {
    selectedPlayerId.value = playerId
    playerDetails.value = null
    playerError.value = ''

    const resolvedSeason = normalizeSelectionId(season ?? selectedSeason.value)

    if (!playerId || !resolvedSeason) {
      playerState.value = 'empty'
      return
    }

    playerState.value = 'loading'

    try {
      const response = await $fetch<Record<string, any>>(
        '/api/sports/basketball/player',
        {
          query: {
            player: playerId,
            season: resolvedSeason,
            ...(selectedLeagueId.value
              ? { league: selectedLeagueId.value }
              : {}),
          },
        },
      )

      playerDetails.value = normalizePlayerDetails(response)
      playerState.value = playerDetails.value.player ? 'ready' : 'empty'
    } catch (error) {
      playerState.value = 'error'
      playerError.value = toErrorMessage(
        error,
        'Failed to load basketball player details',
      )
    }
  }

  const featuredGame = computed(() => {
    if (!games.value.length) {
      return null
    }

    return (
      games.value.find((game) => game.id === selectedGameId.value) ??
      games.value[0] ??
      null
    )
  })

  const scoreOf = (value: unknown) => {
    if (typeof value === 'number') {
      return value
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : null
    }

    return null
  }

  const featuredScore = computed(() => {
    const game = featuredGame.value
    if (!game) {
      return 'vs'
    }

    const homeScore = scoreOf(
      game.scores?.home?.total ?? game.scores?.home?.points,
    )
    const awayScore = scoreOf(
      game.scores?.away?.total ?? game.scores?.away?.points,
    )

    return `${homeScore ?? '-'} - ${awayScore ?? '-'}`
  })

  return {
    leagues,
    games,
    standings,
    leaguesState,
    gamesState,
    standingsState,
    leaguesError,
    gamesError,
    standingsError,
    playerError,
    selectedLeague,
    seasons,
    selectedLeagueId,
    selectedSeason,
    selectedGameId,
    selectedPlayerId,
    playerDetails,
    playerState,
    featuredGame,
    featuredScore,
    loadLeagues,
    loadLeagueSeasonData,
    loadPlayerDetails,
    selectLeague,
    selectSeason,
    selectGame,
  }
}
