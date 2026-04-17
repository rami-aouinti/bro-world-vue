import type { ApiObject } from './common'

export interface BasketballCountry extends ApiObject {
  id: number | null
  name: string
  code: string | null
  flag: string | null
}

export interface BasketballLeague extends ApiObject {
  id: number
  name: string
  type: string
  logo: string | null
  country: BasketballCountry
  seasons: string[]
}

export interface BasketballLeaguesApiResponse extends ApiObject {
  items: BasketballLeague[]
}

export interface BasketballTeam extends ApiObject {
  id: number
  name: string
  code: string | null
  logo: string | null
  country: BasketballCountry | null
  founded: number | null
  national: boolean
}

export interface BasketballTeamsApiResponse extends ApiObject {
  items: BasketballTeam[]
}

export interface BasketballGame extends ApiObject {
  id: number
  date: string | null
  time: string | null
  timestamp: number | null
  timezone: string | null
  stage: string | null
  week: string | null
  status: {
    long: string | null
    short: string | null
    timer: string | null
  }
  league: ApiObject
  country: BasketballCountry | null
  teams: {
    home: BasketballTeam
    away: BasketballTeam
  }
  scores: ApiObject
  periods: ApiObject
}

export interface BasketballGamesApiResponse extends ApiObject {
  items: BasketballGame[]
}

export interface BasketballStandingRow extends ApiObject {
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
  group: {
    name: string | null
  }
}

export interface BasketballStandingsApiResponse extends ApiObject {
  league: {
    id: number | null
    name: string | null
    season: string | null
    logo: string | null
    country: BasketballCountry | null
  }
  groups: Array<{
    name: string
    rows: BasketballStandingRow[]
  }>
}

export interface BasketballPlayerApiResponse extends ApiObject {
  profile: ApiObject | null
  statistics: ApiObject[]
}

export interface BasketballTeamApiResponse extends ApiObject {
  profile: BasketballTeam | null
}

export interface BasketballGameDetailsApiResponse extends ApiObject {
  game: BasketballGame | null
}
