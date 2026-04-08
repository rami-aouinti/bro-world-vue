const CATALOG_CACHE_TTL_MS = 5 * 60 * 1000
const LEVELS_CACHE_TTL_MS = 15 * 60 * 1000

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
        const response = await $fetch<StartSessionPayload>('/api/games/sessions/start', {
          method: 'POST',
          body: { gameId, level },
        })
        this.currentSession = {
          ...response,
          level: response.level ?? level,
        }
        return response
      } catch {
        const fallback = {
          sessionId: crypto.randomUUID(),
          status: 'started',
          coins: 0,
          level,
        }
        this.currentSession = fallback
        this.error = 'Start API unavailable. Demo session created locally.'
        return fallback
      } finally {
        this.startingSession = false
      }
    },
    async finishSession(sessionId: string, result: 'win' | 'lose') {
      this.finishingSession = true
      this.error = ''

      try {
        const response = await $fetch<FinishSessionPayload>('/api/games/sessions/finish', {
          method: 'POST',
          body: { sessionId, result },
        })
        this.currentSession = {
          sessionId: response.sessionId,
          status: response.status,
          coins: response.coins,
          level: this.currentSession?.level,
        }
        return response
      } catch {
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
