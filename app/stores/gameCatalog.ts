const CATALOG_CACHE_TTL_MS = 5 * 60 * 1000
const LEVELS_CACHE_TTL_MS = 15 * 60 * 1000
const ENABLE_DEMO_SESSION_FALLBACK = import.meta.dev && import.meta.env.VITE_ENABLE_DEMO_SESSION_FALLBACK === 'true'

interface GameCatalogGame {
  id: string
  name: string
  description?: string
}

interface GameSubCategory {
  id: string
  name: string
  games: GameCatalogGame[]
}

interface GameCategory {
  id: string
  name: string
  subCategories: GameSubCategory[]
}

interface GameLevel {
  value: string
  label?: string
}

interface GameLevelsResponse {
  items: GameLevel[]
}

interface StartSessionPayload {
  sessionId: string
  status: string
  coins: number
  level?: string
}

interface FinishSessionPayload {
  sessionId: string
  status: string
  coins: number
  result: 'win' | 'lose'
}

interface HttpErrorLike extends Error {
  status?: number
  statusCode?: number
  response?: {
    status?: number
    statusText?: string
  }
}

function buildHttpError(error: unknown, fallbackMessage: string): HttpErrorLike {
  const source =
    error instanceof Error ? (error as HttpErrorLike) : (new Error(fallbackMessage) as HttpErrorLike)
  const status = source.status ?? source.statusCode ?? source.response?.status
  const statusSuffix = status ? ` (HTTP ${status})` : ''
  const message = `${source.message || fallbackMessage}${statusSuffix}`
  const enriched = new Error(message) as HttpErrorLike
  enriched.status = status
  return enriched
}

export const useGameCatalogStore = defineStore('game-catalog', {
  state: () => ({
    categories: [] as GameCategory[],
    levels: [] as string[],
    currentSession: null as StartSessionPayload | null,
    loadingCatalog: false,
    loadingLevels: false,
    startingSession: false,
    finishingSession: false,
    error: '' as string,
    catalogFetchedAt: 0,
    levelsFetchedAt: 0,
  }),
  getters: {
    isCatalogCacheValid: (state) =>
      state.categories.length > 0 && Date.now() - state.catalogFetchedAt < CATALOG_CACHE_TTL_MS,
    isLevelsCacheValid: (state) =>
      state.levels.length > 0 && Date.now() - state.levelsFetchedAt < LEVELS_CACHE_TTL_MS,
  },
  actions: {
    async fetchCatalog(force = false) {
      if (!force && this.isCatalogCacheValid) {
        return this.categories
      }

      this.loadingCatalog = true
      this.error = ''

      try {
        const response = await $fetch<GameCategory[]>('/api/games/catalog')
        this.categories = response
        this.catalogFetchedAt = Date.now()

        await this.fetchLevels(force)

        return this.categories
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unable to load game catalog.'
        throw error
      } finally {
        this.loadingCatalog = false
      }
    },
    async fetchLevels(force = false) {
      if (!force && this.isLevelsCacheValid) {
        return this.levels
      }

      this.loadingLevels = true
      this.error = ''

      try {
        const response = await $fetch<GameLevelsResponse>('/api/games/levels')
        this.levels = response.items.map(item => item.value.toLowerCase())
        this.levelsFetchedAt = Date.now()
        return this.levels
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unable to load game levels.'
        throw error
      } finally {
        this.loadingLevels = false
      }
    },
    async startSession(gameId: string, level: string) {
      this.startingSession = true
      this.error = ''

      try {
        const response = await $fetch<StartSessionPayload>(`/api/games/${gameId}/sessions/start`, {
          method: 'POST',
          body: { level },
        })
        this.currentSession = {
          ...response,
          level: response.level ?? level,
        }
        return response
      } catch (error) {
        if (ENABLE_DEMO_SESSION_FALLBACK) {
          const fallback = {
            sessionId: crypto.randomUUID(),
            status: 'started',
            coins: 0,
            level,
          }
          this.currentSession = fallback
          this.error = 'Start API unavailable. Demo session created locally.'
          return fallback
        }

        const httpError = buildHttpError(error, 'Unable to start session.')
        this.error = httpError.message
        throw httpError
      } finally {
        this.startingSession = false
      }
    },
    async finishSession(sessionId: string, result: 'win' | 'lose') {
      this.finishingSession = true
      this.error = ''

      try {
        const response = await $fetch<FinishSessionPayload>(`/api/games/sessions/${sessionId}/finish`, {
          method: 'POST',
          body: { result },
        })
        this.currentSession = {
          sessionId: response.sessionId,
          status: response.status,
          coins: response.coins,
          level: this.currentSession?.level,
        }
        return response
      } catch (error) {
        if (ENABLE_DEMO_SESSION_FALLBACK) {
          if (!this.currentSession || this.currentSession.sessionId !== sessionId) {
            throw new Error('No active session found')
          }

          const coinDelta = result === 'win' ? 50 : 5
          const fallback = {
            sessionId,
            status: result === 'win' ? 'completed' : 'failed',
            coins: this.currentSession.coins + coinDelta,
            result,
          } satisfies FinishSessionPayload

          this.currentSession = {
            sessionId: fallback.sessionId,
            status: fallback.status,
            coins: fallback.coins,
            level: this.currentSession?.level,
          }
          this.error = 'Finish API unavailable. Demo result applied locally.'
          return fallback
        }

        const httpError = buildHttpError(error, 'Unable to finish session.')
        this.error = httpError.message
        throw httpError
      } finally {
        this.finishingSession = false
      }
    },
  },
})

export type {
  GameCategory,
  GameSubCategory,
  GameCatalogGame,
  GameLevel,
  GameLevelsResponse,
  StartSessionPayload,
  FinishSessionPayload,
}
