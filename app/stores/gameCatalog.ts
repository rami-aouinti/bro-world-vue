const CATALOG_TTL_MS = 5 * 60 * 1000
const LEVELS_TTL_MS = 15 * 60 * 1000

interface GameItem {
  id: string
  name: string
  description: string | null
  thumbnailUrl: string | null
  enabled: boolean
}

interface GameSubCategory {
  id: string
  name: string
  description: string | null
  games: GameItem[]
}

interface GameCategory {
  id: string
  name: string
  description: string | null
  subCategories: GameSubCategory[]
  games: GameItem[]
}

type GameLevelsResponse = {
  items: Array<{
    id: string
    value: string
    label: string
    description: string
  }>
}

type StartResponse = {
  session: {
    id: string
    gameId: string
    level: string
    status: string
    startedAt: string
  }
  userGameId: string
  coins: number
}

type FinishResponse = {
  userGame: {
    id: string
    sessionId: string
    gameId: string
    level: string
    status: string
    result: 'win' | 'lose'
    finishedAt: string
  }
  coins: number
}

interface CurrentSessionState {
  sessionId: string
  status: string
  coins: number
  level: string
  userGameId: string
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
    levels: [] as GameLevelsResponse['items'],
    currentSession: null as CurrentSessionState | null,
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
      state.categories.length > 0 && Date.now() - state.catalogFetchedAt < CATALOG_TTL_MS,
    isLevelsCacheValid: (state) =>
      state.levels.length > 0 && Date.now() - state.levelsFetchedAt < LEVELS_TTL_MS,
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
        this.levels = response.items
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
      const profileStore = useProfileStore()

      try {
        const response = await $fetch<StartResponse>(`/api/games/${gameId}/sessions/start`, {
          method: 'POST',
          body: { level },
        })
        this.currentSession = {
          sessionId: response.session.id,
          status: response.session.status,
          coins: response.coins,
          level: response.session.level ?? level,
          userGameId: response.userGameId,
        }
        if (profileStore.profile) {
          profileStore.profile.coins = response.coins
        }
        return response
      } catch (error) {
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
      const profileStore = useProfileStore()

      try {
        const response = await $fetch<FinishResponse>(`/api/games/sessions/${sessionId}/finish`, {
          method: 'POST',
          body: { result },
        })
        if (this.currentSession) {
          this.currentSession = {
            ...this.currentSession,
            status: response.userGame.status,
            coins: response.coins,
          }
        }
        if (profileStore.profile) {
          profileStore.profile.coins = response.coins
        }
        return response
      } catch (error) {
        const httpError = buildHttpError(error, 'Unable to finish session.')
        this.error = httpError.message
        throw httpError
      } finally {
        this.finishingSession = false
      }
    },
  },
})

export type { CurrentSessionState }
