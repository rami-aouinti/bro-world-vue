import type {
  GamesSessionFinishPayload,
  GamesSessionFinishResponse,
  GamesSessionStartPayload,
  GamesSessionStartResponse,
  GamesCatalogApiResponse,
  GamesLevelsApiResponse,
} from '~~/server/types/api/games'
import { mapCatalogResponseToCategories, mapLevelsResponseToValues } from '~/utils/gamesMapper'

const CATALOG_CACHE_TTL_MS = 5 * 60 * 1000
const LEVELS_CACHE_TTL_MS = 15 * 60 * 1000
const ENABLE_DEMO_SESSION_FALLBACK = import.meta.dev && import.meta.env.VITE_ENABLE_DEMO_SESSION_FALLBACK === 'true'

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
    categories: [] as GamesCatalogApiResponse,
    levels: [] as string[],
    currentSession: null as CurrentSessionState | null,
    loadingCatalog: false,
    loadingLevels: false,
    startingSession: false,
    finishingSession: false,
    error: '' as string,
    levelsError: '' as string,
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
        const response = await $fetch<GamesCatalogApiResponse>('/api/games/catalog')
        this.categories = mapCatalogResponseToCategories(response)
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
      this.levelsError = ''

      try {
        const response = await $fetch<GamesLevelsApiResponse>('/api/games/levels')
        this.levels = mapLevelsResponseToValues(response)
        this.levelsFetchedAt = Date.now()
        return this.levels
      } catch (error) {
        this.levelsError = error instanceof Error ? error.message : 'Unable to load game levels.'
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
        const payload: GamesSessionStartPayload = { level }
        const response = await $fetch<GamesSessionStartResponse>(`/api/games/${gameId}/sessions/start`, {
          method: 'POST',
          body: payload,
        })
        this.currentSession = {
          sessionId: response.session.id,
          status: response.session.status,
          coins: response.coins,
          level: response.session.level ?? level,
          userGameId: response.userGameId,
        }
        if (profileStore.profile) {
          profileStore.setCoins(response.coins)
        }
        return response
      } catch (error) {
        if (ENABLE_DEMO_SESSION_FALLBACK) {
          const fallback: GamesSessionStartResponse = {
            session: {
              id: crypto.randomUUID(),
              gameId,
              level,
              status: 'started',
              startedAt: new Date().toISOString(),
            },
            userGameId: crypto.randomUUID(),
            coins: 0,
          }
          this.currentSession = {
            sessionId: fallback.session.id,
            status: fallback.session.status,
            coins: fallback.coins,
            level: fallback.session.level,
            userGameId: fallback.userGameId,
          }
          if (profileStore.profile) {
            profileStore.setCoins(fallback.coins)
          }
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
      const profileStore = useProfileStore()

      try {
        const payload: GamesSessionFinishPayload = { result }
        const response = await $fetch<GamesSessionFinishResponse>(`/api/games/sessions/${sessionId}/finish`, {
          method: 'POST',
          body: payload,
        })
        if (this.currentSession) {
          this.currentSession = {
            ...this.currentSession,
            status: response.userGame.status,
            coins: response.coins,
          }
        }
        if (profileStore.profile) {
          profileStore.setCoins(response.coins)
        }
        return response
      } catch (error) {
        if (ENABLE_DEMO_SESSION_FALLBACK) {
          if (!this.currentSession || this.currentSession.sessionId !== sessionId) {
            throw new Error('No active session found')
          }

          const coinDelta = result === 'win' ? 50 : 5
          const fallback: GamesSessionFinishResponse = {
            userGame: {
              id: this.currentSession.userGameId,
              sessionId,
              gameId: '',
              level: this.currentSession.level,
              status: result === 'win' ? 'completed' : 'failed',
              result,
              finishedAt: new Date().toISOString(),
            },
            coins: this.currentSession.coins + coinDelta,
          }

          this.currentSession = {
            ...this.currentSession,
            status: fallback.userGame.status,
            coins: fallback.coins,
          }
          if (profileStore.profile) {
            profileStore.setCoins(fallback.coins)
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

export type { CurrentSessionState }
