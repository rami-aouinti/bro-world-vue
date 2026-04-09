import type { ApiObject } from './common'

export interface GamesCatalogGame extends ApiObject {
  id: string
  name: string
  description: string | null
  thumbnailUrl: string | null
  enabled: boolean
}

export interface GamesCatalogSubCategory extends ApiObject {
  id: string
  name: string
  description: string | null
  games: GamesCatalogGame[]
}

export interface GamesCatalogCategory extends ApiObject {
  id: string
  name: string
  description: string | null
  subCategories: GamesCatalogSubCategory[]
  games: GamesCatalogGame[]
}

export type GamesCatalogApiResponse = GamesCatalogCategory[]

export type GamesLevelsApiResponse = ApiObject & {
  items: Array<{
    id: string
    value: string
    label: string
    description: string
  }>
}

export type GamesSessionMode = 'solo' | 'versus' | 'team' | 'table'
export type GamesSessionOpponentType = 'none' | 'human_online' | 'ai_bot'

export interface GamesSessionStartPayload extends ApiObject {
  level: string
  mode: GamesSessionMode
  playerCount: number
  opponentType: GamesSessionOpponentType
  seatCount?: number
  allowedPlayerCounts?: number[]
}

export interface GamesSessionSeat extends ApiObject {
  seat: number
  teamKey?: string | null
  playerId?: string | null
  isCurrentPlayer?: boolean
}

export interface GamesSessionContext extends ApiObject {
  mode: GamesSessionMode
  playerCount: number
  opponentType: GamesSessionOpponentType
  seatCount?: number
  allowedPlayerCounts?: number[]
  seats?: GamesSessionSeat[]
}

export interface GamesSession extends ApiObject {
  id: string
  gameId: string
  level: string
  status: string
  startedAt: string
  context?: GamesSessionContext
}

export interface GamesSessionStartResponse extends ApiObject {
  session: GamesSession
  userGameId: string
  coins: number
}

export interface GamesSessionFinishPayload extends ApiObject {
  result: 'win' | 'lose'
}

export interface GamesUserGame extends ApiObject {
  id: string
  sessionId: string
  gameId: string
  level: string
  status: string
  result: 'win' | 'lose'
  finishedAt: string
}

export interface GamesSessionFinishResponse extends ApiObject {
  userGame: GamesUserGame
  coins: number
}
