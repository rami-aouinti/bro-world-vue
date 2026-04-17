import type { ApiObject } from './common'

export interface FootballCoverage extends ApiObject {
  fixtures: {
    events: boolean
    lineups: boolean
    statisticsFixtures: boolean
    statisticsPlayers: boolean
  }
  standings: boolean
  players: boolean
  topScorers: boolean
  topAssists: boolean
  topCards: boolean
  injuries: boolean
  predictions: boolean
  odds: boolean
}

export interface FootballSeason extends ApiObject {
  year: number
  start: string
  end: string
  current: boolean
  coverage: FootballCoverage
}

export interface FootballCountry extends ApiObject {
  name: string
  code: string | null
  flag: string | null
}

export interface FootballLeague extends ApiObject {
  id: number
  name: string
  type: string
  logo: string | null
  country: FootballCountry
  seasons: FootballSeason[]
}

export interface FootballLeaguesApiResponse extends ApiObject {
  items: FootballLeague[]
}

export interface FootballTeam extends ApiObject {
  id: number
  name: string
  code: string | null
  country: string | null
  founded: number | null
  national: boolean
  logo: string | null
}

export interface FootballTeamsApiResponse extends ApiObject {
  items: FootballTeam[]
}

export interface FootballTeamStatisticsApiResponse extends ApiObject {
  league: {
    id: number
    name: string
    country: string
    season: number
  }
  team: FootballTeam
  form: string | null
  fixtures: ApiObject
  goals: ApiObject
  biggest: ApiObject
  cleanSheet: ApiObject
  failedToScore: ApiObject
  penalty: ApiObject
  lineups: ApiObject[]
  cards: ApiObject
}

export interface FootballSquadPlayer extends ApiObject {
  id: number
  name: string
  age: number | null
  number: number | null
  position: string | null
  photo: string | null
}

export interface FootballTeamSquadApiResponse extends ApiObject {
  team: FootballTeam
  players: FootballSquadPlayer[]
}

export interface FootballPlayerProfile extends ApiObject {
  id: number
  name: string
  firstname: string | null
  lastname: string | null
  age: number | null
  birth: ApiObject
  nationality: string | null
  height: string | null
  weight: string | null
  photo: string | null
}

export interface FootballPlayerApiResponse extends ApiObject {
  profile: FootballPlayerProfile | null
  statistics: ApiObject[]
}

export interface FootballFixture extends ApiObject {
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
    short: string
    long: string
    elapsed: number | null
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
    home: FootballTeam & { winner: boolean | null }
    away: FootballTeam & { winner: boolean | null }
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

export interface FootballFixturesApiResponse extends ApiObject {
  items: FootballFixture[]
}

export interface FootballStandingRow extends ApiObject {
  rank: number
  team: FootballTeam
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
}

export interface FootballStandingsGroup extends ApiObject {
  name: string
  rows: FootballStandingRow[]
}

export interface FootballStandingsApiResponse extends ApiObject {
  league: {
    id: number
    name: string
    country: string
    logo: string | null
    flag: string | null
    season: number
  }
  groups: FootballStandingsGroup[]
}

export interface FootballFixtureEvent extends ApiObject {
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

export interface FootballLineupPlayer extends ApiObject {
  id: number | null
  name: string
  number: number | null
  pos: string | null
  grid: string | null
}

export interface FootballLineup extends ApiObject {
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
  startXI: FootballLineupPlayer[]
  substitutes: FootballLineupPlayer[]
}

export interface FootballPlayerStatistic extends ApiObject {
  team: {
    id: number
    name: string
    logo: string | null
  }
  player: {
    id: number
    name: string
    photo: string | null
  }
  statistics: ApiObject[]
}

export interface FootballFixtureDetailsApiResponse extends ApiObject {
  fixture: FootballFixture | null
  events: FootballFixtureEvent[]
  lineups: FootballLineup[]
  playerStats: FootballPlayerStatistic[]
}

export interface FootballOddsApiResponse extends ApiObject {
  items: ApiObject[]
  paging: {
    current: number
    total: number
  }
}
