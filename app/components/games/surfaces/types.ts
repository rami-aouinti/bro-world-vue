export interface GameSurfaceSession {
  sessionId: string
  level?: string
  status?: string
  coins?: number
}

export interface GameSurfacePlayer {
  id: string
  name: string
  stack?: string | number
  position?: 'top' | 'right' | 'bottom' | 'left'
  side?: 'light' | 'dark'
  score?: number | string
  isActive?: boolean
}

export interface GameSurfaceProps {
  session: GameSurfaceSession | null
  players: GameSurfacePlayer[]
  gameState: Record<string, unknown> | null
}
