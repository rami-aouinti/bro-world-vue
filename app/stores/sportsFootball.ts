interface FootballLeagueSeason {
  year: number
  current: boolean
}

interface FootballLeague {
  id: number
  name: string
  country?: {
    name?: string
  }
  seasons: FootballLeagueSeason[]
}

interface FootballFixture {
  id: number
  date?: string
  teams?: {
    home?: { name?: string }
    away?: { name?: string }
  }
}

interface FootballStandingRow {
  rank: number
  points: number
  team: { id: number; name: string }
  all?: { played?: number }
}

interface FootballStandingsGroup {
  name: string
  rows: FootballStandingRow[]
}

interface FootballTeam {
  id: number
  name: string
}

interface FootballFixtureDetails {
  fixture: FootballFixture | null
  events: Array<{
    time?: { elapsed?: number | null }
    team?: { name?: string | null }
    player?: { name?: string | null }
    type?: string
  }>
  lineups: unknown[]
  playerStats: unknown[]
}

type FootballResource =
  | 'leagues'
  | 'fixtures'
  | 'standings'
  | 'teams'
  | 'fixtureDetails'

type FootballResourceState = Record<FootballResource, boolean>
type FootballResourceErrorState = Record<FootballResource, string>

function normalizeUiError(error: unknown, fallbackMessage: string) {
  const source = (error ?? {}) as {
    data?: { message?: unknown }
    statusMessage?: unknown
    message?: unknown
    status?: unknown
    statusCode?: unknown
  }

  const message =
    typeof source.data?.message === 'string' && source.data.message.length > 0
      ? source.data.message
      : typeof source.statusMessage === 'string' && source.statusMessage.length > 0
        ? source.statusMessage
        : typeof source.message === 'string' && source.message.length > 0
          ? source.message
          : fallbackMessage

  const statusCode =
    typeof source.status === 'number'
      ? source.status
      : typeof source.statusCode === 'number'
        ? source.statusCode
        : null

  return statusCode ? `${message} (HTTP ${statusCode})` : message
}

export const useSportsFootballStore = defineStore('sports-football', {
  state: () => ({
    selectedLeagueId: null as number | null,
    selectedSeason: null as number | null,
    selectedFixtureId: null as number | null,
    selectedTeamId: null as number | null,
    leagues: [] as FootballLeague[],
    fixtures: [] as FootballFixture[],
    standings: [] as FootballStandingsGroup[],
    teams: [] as FootballTeam[],
    fixtureDetails: null as FootballFixtureDetails | null,
    loading: {
      leagues: false,
      fixtures: false,
      standings: false,
      teams: false,
      fixtureDetails: false,
    } as FootballResourceState,
    error: {
      leagues: '',
      fixtures: '',
      standings: '',
      teams: '',
      fixtureDetails: '',
    } as FootballResourceErrorState,
  }),
  actions: {
    clearResourceError(resource: FootballResource) {
      this.error[resource] = ''
    },
    setResourceLoading(resource: FootballResource, value: boolean) {
      this.loading[resource] = value
    },
    setResourceError(resource: FootballResource, error: unknown, fallback: string) {
      this.error[resource] = normalizeUiError(error, fallback)
    },
    async fetchLeagues() {
      this.setResourceLoading('leagues', true)
      this.clearResourceError('leagues')

      try {
        const response = await $fetch<{ items?: FootballLeague[] }>('/api/sports/football/leagues')
        this.leagues = Array.isArray(response.items) ? response.items : []
        return this.leagues
      }
      catch (error) {
        this.leagues = []
        this.setResourceError('leagues', error, 'Impossible de charger les ligues.')
        throw error
      }
      finally {
        this.setResourceLoading('leagues', false)
      }
    },
    async fetchFixturesByLeagueSeason(leagueId: number, season: number) {
      this.selectedLeagueId = leagueId
      this.selectedSeason = season
      this.selectedFixtureId = null

      this.setResourceLoading('fixtures', true)
      this.clearResourceError('fixtures')

      try {
        const response = await $fetch<{ items?: FootballFixture[] }>('/api/sports/football/fixtures', {
          query: { league: leagueId, season },
        })

        this.fixtures = Array.isArray(response.items) ? response.items : []
        return this.fixtures
      }
      catch (error) {
        this.fixtures = []
        this.setResourceError('fixtures', error, 'Impossible de charger les matches.')
        throw error
      }
      finally {
        this.setResourceLoading('fixtures', false)
      }
    },
    async fetchStandings(leagueId: number, season: number) {
      this.selectedLeagueId = leagueId
      this.selectedSeason = season

      this.setResourceLoading('standings', true)
      this.clearResourceError('standings')

      try {
        const response = await $fetch<{ groups?: FootballStandingsGroup[] }>('/api/sports/football/standings', {
          query: { league: leagueId, season },
        })

        this.standings = Array.isArray(response.groups) ? response.groups : []
        return this.standings
      }
      catch (error) {
        this.standings = []
        this.setResourceError('standings', error, 'Impossible de charger le classement.')
        throw error
      }
      finally {
        this.setResourceLoading('standings', false)
      }
    },
    async fetchTeamsByLeagueSeason(leagueId: number, season: number) {
      this.selectedLeagueId = leagueId
      this.selectedSeason = season
      this.selectedTeamId = null

      this.setResourceLoading('teams', true)
      this.clearResourceError('teams')

      try {
        const response = await $fetch<{ items?: FootballTeam[] }>('/api/sports/football/teams', {
          query: { league: leagueId, season },
        })

        this.teams = Array.isArray(response.items) ? response.items : []
        return this.teams
      }
      catch (error) {
        this.teams = []
        this.setResourceError('teams', error, 'Impossible de charger les équipes.')
        throw error
      }
      finally {
        this.setResourceLoading('teams', false)
      }
    },
    async fetchFixtureDetails(fixtureId: number) {
      this.selectedFixtureId = fixtureId

      this.setResourceLoading('fixtureDetails', true)
      this.clearResourceError('fixtureDetails')

      try {
        const response = await $fetch<FootballFixtureDetails>('/api/sports/football/fixture', {
          query: { fixture: fixtureId },
        })

        this.fixtureDetails = {
          fixture: response?.fixture || null,
          events: Array.isArray(response?.events) ? response.events : [],
          lineups: Array.isArray(response?.lineups) ? response.lineups : [],
          playerStats: Array.isArray(response?.playerStats) ? response.playerStats : [],
        }

        return this.fixtureDetails
      }
      catch (error) {
        this.fixtureDetails = null
        this.setResourceError('fixtureDetails', error, 'Impossible de charger le détail du match.')
        throw error
      }
      finally {
        this.setResourceLoading('fixtureDetails', false)
      }
    },
  },
})
