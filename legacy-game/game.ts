export type PlayMode = 'ai' | 'pvp'
export type ConceptPlayMode = PlayMode | 'online'
export type ApiPlayMode =
  | 'solo'
  | 'versus'
  | 'online'
  | 'endless'
  | 'ai'
  | 'pvp'
export type BeloteMode = 'teams' | 'free-for-all'
export type GameDevelopmentStatus = 'playable' | 'prototype' | 'coming_soon'
export type GameMood = 'competitive' | 'chill' | 'arcade' | 'strategy'
export type GameVisualStyle = 'neon' | 'classic' | 'minimal'

export interface GameEntry {
  id: string
  key?: string
  categoryKey?: string
  subcategoryKey?: string
  difficultyKey?: string
  tags?: string[]
  features?: string[]
  mood?: GameMood
  visualStyle?: GameVisualStyle
  soundProfile?: string
  lobbyBackground?: string
  intensityLevel?: string | number
  plannedModes?: ConceptPlayMode[]
  artDirection?: string
  averageDuration?: string
  nameKey: string
  descriptionKey: string
  img: string
  icon: string
  component:
    | 'rami'
    | 'belote'
    | 'checkers'
    | 'poker'
    | 'solitaire'
    | 'hearts'
    | 'spades'
    | 'game2048'
    | 'sudoku'
    | 'chess'
    | 'hidden-word'
    | 'nonogram'
    | 'uno'
    | 'ludo'
    | 'flappy-rocket'
    | null
  supportedModes: PlayMode[]
  developmentStatus: GameDevelopmentStatus
  availableModes?: PlayMode[]
}

export interface GameSubCategory {
  id: string
  key?: string
  nameKey: string
  descriptionKey: string
  img: string
  icon: string
  games: GameEntry[]
}

export interface GameCategory {
  id: string
  key?: string
  nameKey: string
  descriptionKey: string
  img: string
  icon: string
  subCategories: GameSubCategory[]
}

export interface ApiGameEntry extends Omit<
  GameEntry,
  'supportedModes' | 'developmentStatus' | 'availableModes'
> {
  supportedModes: ApiPlayMode[]
  developmentStatus?: GameDevelopmentStatus
  availableModes?: ApiPlayMode[]
}

export interface ApiGameSubCategory extends Omit<GameSubCategory, 'games'> {
  games: ApiGameEntry[]
}

export interface ApiGameCategory extends Omit<GameCategory, 'subCategories'> {
  subCategories: ApiGameSubCategory[]
}
