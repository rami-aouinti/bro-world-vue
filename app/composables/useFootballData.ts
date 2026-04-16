export type SectionState = 'loading' | 'error' | 'empty' | 'ready'
export type FootballSectionKey =
  | 'leagues'
  | 'fixtures'
  | 'standings'
  | 'teams'
  | 'fixtureDetails'

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

export interface FootballFixture {
  id: number
  date: string
  teams: {
    home: { name: string }
    away: { name: string }
  }
}

export interface FootballTeam {
  id: number
  name: string
}

export interface FootballStandingRow {
  rank: number
  points: number
  team: { id: number; name: string }
  all: { played: number }
}

export interface FootballStandingsGroup {
  name: string
  rows: FootballStandingRow[]
}

export interface FootballFixtureDetails {
  fixture: FootballFixture | null
  events: Array<{
    time: { elapsed: number | null }
    team: { name: string | null }
    player: { name: string | null }
    type: string
  }>
  lineups: unknown[]
  playerStats: unknown[]
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

export function useFootballData() {
  const leagues = ref<FootballLeague[]>([])
  const fixtures = ref<FootballFixture[]>([])
  const standings = ref<FootballStandingsGroup[]>([])
  const teams = ref<FootballTeam[]>([])
  const fixtureDetails = ref<FootballFixtureDetails | null>(null)

  const selectedLeagueId = ref<number | null>(null)
  const selectedSeason = ref<number | null>(null)
  const selectedFixtureId = ref<number | null>(null)

  const leaguesState = ref<SectionState>('loading')
  const fixturesState = ref<SectionState>('empty')
  const standingsState = ref<SectionState>('empty')
  const teamsState = ref<SectionState>('empty')
  const fixtureDetailsState = ref<SectionState>('empty')

  const leaguesError = ref('')
  const fixturesError = ref('')
  const standingsError = ref('')
  const teamsError = ref('')
  const fixtureDetailsError = ref('')

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
        title: 'Leagues',
        state: leaguesState.value,
        error: leaguesError.value,
        emptyMessage: 'No league available.',
      },
      {
        key: 'fixtures',
        title: 'Fixtures / Matches',
        state: fixturesState.value,
        error: fixturesError.value,
        emptyMessage: 'No fixture for this league/season.',
      },
      {
        key: 'standings',
        title: 'Results / Standings',
        state: standingsState.value,
        error: standingsError.value,
        emptyMessage: 'No standings data.',
      },
      {
        key: 'teams',
        title: 'Clubs / Teams',
        state: teamsState.value,
        error: teamsError.value,
        emptyMessage: 'No teams data.',
      },
      {
        key: 'fixtureDetails',
        title: 'Fixture details',
        state: fixtureDetailsState.value,
        error: fixtureDetailsError.value,
        emptyMessage: 'Select a fixture to see events, lineups and player stats.',
      },
    ]
  })

  const resetLeagueDependentData = () => {
    fixtures.value = []
    standings.value = []
    teams.value = []
    fixtureDetails.value = null
    selectedFixtureId.value = null
    fixturesError.value = ''
    standingsError.value = ''
    teamsError.value = ''
    fixtureDetailsError.value = ''
    fixturesState.value = 'empty'
    standingsState.value = 'empty'
    teamsState.value = 'empty'
    fixtureDetailsState.value = 'empty'
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
        'Impossible de charger les ligues.',
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
    fixtureDetailsError.value = ''
    fixtureDetailsState.value = 'empty'

    const league = selectedLeagueId.value
    const season = selectedSeason.value

    const [fixturesResult, standingsResult, teamsResult] =
      await Promise.allSettled([
        $fetch<{ items: FootballFixture[] }>('/api/sports/football/fixtures', {
          query: { league, season },
        }),
        $fetch<{ groups: FootballStandingsGroup[] }>(
          '/api/sports/football/standings',
          {
            query: { league, season },
          },
        ),
        $fetch<{ items: FootballTeam[] }>('/api/sports/football/teams', {
          query: { league, season },
        }),
      ])

    if (fixturesResult.status === 'fulfilled') {
      fixtures.value = fixturesResult.value.items
      fixturesState.value = fixtures.value.length ? 'ready' : 'empty'
      fixturesError.value = ''
    } else {
      fixtures.value = []
      fixturesState.value = 'error'
      fixturesError.value = toErrorMessage(
        fixturesResult.reason,
        'Impossible de charger les matches.',
      )
    }

    if (standingsResult.status === 'fulfilled') {
      standings.value = standingsResult.value.groups
      standingsState.value = standings.value.length ? 'ready' : 'empty'
      standingsError.value = ''
    } else {
      standings.value = []
      standingsState.value = 'error'
      standingsError.value = toErrorMessage(
        standingsResult.reason,
        'Impossible de charger le classement.',
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
        'Impossible de charger les équipes.',
      )
    }
  }

  const selectLeague = (leagueId: number | null) => {
    selectedLeagueId.value = leagueId

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

  const selectSeason = (season: number | null) => {
    selectedSeason.value = season
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
        'Impossible de charger le détail du match.',
      )
    }
  }

  return {
    leagues,
    fixtures,
    standings,
    teams,
    fixtureDetails,
    footballSections,
    selectedLeague,
    seasons,
    selectedLeagueId,
    selectedSeason,
    selectedFixtureId,
    leaguesState,
    fixturesState,
    standingsState,
    teamsState,
    fixtureDetailsState,
    leaguesError,
    fixturesError,
    standingsError,
    teamsError,
    fixtureDetailsError,
    loadLeagues,
    loadLeagueSeasonData,
    loadFixtureDetails,
    selectLeague,
    selectSeason,
  }
}
