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

  const selectedLeagueId = ref<number | null>(null)
  const selectedSeason = ref<number | null>(null)
  const selectedGameId = ref<number | null>(null)

  const selectedLeague = computed<BasketballLeague | null>(() => {
    if (!selectedLeagueId.value) return null
    return leagues.value.find((league) => league.id === selectedLeagueId.value) ?? null
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
    gamesState.value = 'empty'
    standingsState.value = 'empty'
    gamesError.value = ''
    standingsError.value = ''
  }

  const loadLeagues = async () => {
    leaguesState.value = 'loading'
    leaguesError.value = ''

    try {
      const response = await $fetch<{ items: BasketballLeague[] }>('/api/sports/basketball/leagues')
      leagues.value = response.items
      leaguesState.value = leagues.value.length ? 'ready' : 'empty'

      if (leagues.value.length && !selectedLeagueId.value) {
        selectedLeagueId.value = leagues.value[0]?.id ?? null
        selectedSeason.value = seasons.value[0] ?? null
      }
    } catch (error) {
      leagues.value = []
      leaguesState.value = 'error'
      leaguesError.value = toErrorMessage(error, 'Failed to load basketball leagues')
      resetLeagueData()
    }
  }

  const loadLeagueSeasonData = async () => {
    if (!selectedLeagueId.value || !selectedSeason.value) {
      resetLeagueData()
      return
    }

    gamesState.value = 'loading'
    standingsState.value = 'loading'
    gamesError.value = ''
    standingsError.value = ''

    const league = selectedLeagueId.value
    const season = selectedSeason.value

    const [gamesResult, standingsResult] = await Promise.allSettled([
      $fetch<{ items: BasketballGame[] }>('/api/sports/basketball/games', {
        query: { league, season },
      }),
      $fetch<{ groups: Array<{ rows: BasketballStandingRow[] }> }>('/api/sports/basketball/standings', {
        query: { league, season },
      }),
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
      gamesError.value = toErrorMessage(gamesResult.reason, 'Failed to load basketball games')
    }

    if (standingsResult.status === 'fulfilled') {
      standings.value = standingsResult.value.groups?.[0]?.rows ?? []
      standingsState.value = standings.value.length ? 'ready' : 'empty'
    } else {
      standings.value = []
      standingsState.value = 'error'
      standingsError.value = toErrorMessage(standingsResult.reason, 'Failed to load basketball standings')
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

  const featuredGame = computed(() => {
    if (!games.value.length) {
      return null
    }

    return games.value.find((game) => game.id === selectedGameId.value) ?? games.value[0] ?? null
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

    const homeScore = scoreOf(game.scores?.home?.total ?? game.scores?.home?.points)
    const awayScore = scoreOf(game.scores?.away?.total ?? game.scores?.away?.points)

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
    selectedLeague,
    seasons,
    selectedLeagueId,
    selectedSeason,
    selectedGameId,
    featuredGame,
    featuredScore,
    loadLeagues,
    loadLeagueSeasonData,
    selectLeague,
    selectSeason,
    selectGame,
  }
}
