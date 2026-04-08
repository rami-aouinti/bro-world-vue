import type { ApiObject } from './common'

export interface GamesCatalogApiResponse extends ApiObject {
  games?: ApiObject[]
}

export interface GamesLevelsApiResponse extends ApiObject {
  levels?: ApiObject[]
}

export interface GamesSessionStartPayload extends ApiObject {
  levelId?: string
  context?: ApiObject
}

export interface GamesSessionStartResponse extends ApiObject {
  sessionId?: string
  status?: string
}

export interface GamesSessionFinishPayload extends ApiObject {
  score?: number
  result?: string
  context?: ApiObject
}

export interface GamesSessionFinishResponse extends ApiObject {
  sessionId?: string
  status?: string
  rewards?: ApiObject
}
