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

export interface GamesSessionStartPayload extends ApiObject {
  level: string
}

export interface GamesSession extends ApiObject {
  id: string
  gameId: string
  level: string
  status: string
  startedAt: string
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
