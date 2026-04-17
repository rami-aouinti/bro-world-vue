import type { ApiObject } from '../common'

export interface ApiSportsBasketballResponse<TItem> {
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

export interface ApiSportsBasketballLeagueItem {
  id: number
  name: string
  type: string
  logo: string | null
  country: {
    id: number | null
    name: string
    code: string | null
    flag: string | null
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

export interface ApiSportsBasketballTeamItem {
  id: number
  name: string
  code: string | null
  logo?: string | null
  country?: {
    id: number | null
    name: string
    code: string | null
    flag: string | null
  }
  founded?: number | null
  national?: boolean
}

export interface ApiSportsBasketballGameItem {
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
  country?: {
    id: number | null
    name: string
    code: string | null
    flag: string | null
  }
  teams: {
    home: ApiSportsBasketballTeamItem
    away: ApiSportsBasketballTeamItem
  }
  scores: ApiObject
  periods: ApiObject
}

export interface ApiSportsBasketballStandingItem {
  position: number
  stage: string | null
  group: {
    name: string | null
  }
  team: ApiSportsBasketballTeamItem
  league: {
    id: number | null
    name: string | null
    season: string | null
    logo: string | null
  }
  country?: {
    id: number | null
    name: string
    code: string | null
    flag: string | null
  }
  games: {
    played: number
    win: {
      total: number
      percentage: string | null
    }
    lose: {
      total: number
      percentage: string | null
    }
  }
  points: {
    for: number
    against: number
  }
  form: string | null
}

export interface ApiSportsBasketballPlayerItem {
  id: number
  firstname: string | null
  lastname: string | null
  birth: ApiObject
  nba: ApiObject
  height: ApiObject
  weight: ApiObject
  college: string | null
  affiliation: string | null
  leagues: ApiObject
}
