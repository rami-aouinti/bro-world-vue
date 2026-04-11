import type { ApiObject } from '../common'

export interface ApiSportsResponse<TItem> {
  get: string
  parameters: Record<string, string>
  errors: Record<string, string>
  results: number
  paging: {
    current: number
    total: number
  }
  response: TItem[]
}

export interface ApiSportsLeagueItem {
  league: {
    id: number
    name: string
    type: string
    logo: string | null
  }
  country: {
    name: string
    code: string | null
    flag: string | null
  }
  seasons: Array<{
    year: number
    start: string
    end: string
    current: boolean
    coverage: {
      fixtures: {
        events: boolean
        lineups: boolean
        statistics_fixtures: boolean
        statistics_players: boolean
      }
      standings: boolean
      players: boolean
      top_scorers: boolean
      top_assists: boolean
      top_cards: boolean
      injuries: boolean
      predictions: boolean
      odds: boolean
    }
  }>
}

export interface ApiSportsTeamItem {
  team: {
    id: number
    name: string
    code: string | null
    country: string | null
    founded: number | null
    national: boolean
    logo: string | null
  }
}

export interface ApiSportsFixtureItem {
  fixture: {
    id: number
    referee: string | null
    timezone: string
    date: string
    timestamp: number
    venue: {
      id: number | null
      name: string | null
      city: string | null
    }
    status: {
      long: string
      short: string
      elapsed: number | null
    }
  }
  league: {
    id: number
    name: string
    country: string
    logo: string | null
    season: number
    round: string | null
  }
  teams: {
    home: {
      id: number
      name: string
      logo: string | null
      winner: boolean | null
    }
    away: {
      id: number
      name: string
      logo: string | null
      winner: boolean | null
    }
  }
  goals: {
    home: number | null
    away: number | null
  }
  score: {
    halftime: { home: number | null; away: number | null }
    fulltime: { home: number | null; away: number | null }
    extratime: { home: number | null; away: number | null }
    penalty: { home: number | null; away: number | null }
  }
}

export interface ApiSportsStandingLeagueItem {
  league: {
    id: number
    name: string
    country: string
    logo: string | null
    flag: string | null
    season: number
    standings: Array<
      Array<{
        rank: number
        team: {
          id: number
          name: string
          logo: string | null
        }
        points: number
        goalsDiff: number
        group: string | null
        form: string | null
        status: string | null
        description: string | null
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
      }>
    >
  }
}

export interface ApiSportsFixtureEventItem {
  time: {
    elapsed: number | null
    extra: number | null
  }
  team: {
    id: number | null
    name: string | null
    logo: string | null
  }
  player: {
    id: number | null
    name: string | null
  }
  assist: {
    id: number | null
    name: string | null
  }
  type: string
  detail: string
  comments: string | null
}

export interface ApiSportsLineupItem {
  team: {
    id: number
    name: string
    logo: string | null
    colors?: ApiObject
  }
  coach: {
    id: number | null
    name: string | null
    photo: string | null
  }
  formation: string | null
  startXI: Array<{
    player: {
      id: number | null
      name: string
      number: number | null
      pos: string | null
      grid: string | null
    }
  }>
  substitutes: Array<{
    player: {
      id: number | null
      name: string
      number: number | null
      pos: string | null
      grid: string | null
    }
  }>
}

export interface ApiSportsPlayerStatsItem {
  team: {
    id: number
    name: string
    logo: string | null
  }
  players: Array<{
    player: {
      id: number
      name: string
      photo: string | null
    }
    statistics: ApiObject[]
  }>
}
