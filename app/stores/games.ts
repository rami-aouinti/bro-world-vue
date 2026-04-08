import { useProfileStore } from './profile'

const CATALOG_CACHE_TTL_MS = 5 * 60 * 1000
const LEVELS_CACHE_TTL_MS = 15 * 60 * 1000

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
  items: GameItem[]
}

interface GameCategory {
  id: string
  name: string
  description: string | null
  subCategories: GameSubCategory[]
}

interface GameLevelItem {
  id: string
  label: string
  description: string | null
  difficulty: 'easy' | 'medium' | 'hard' | string
}

interface GameSessionStartResponse {
  sessionId: string
  gameId: string
  level: string
  status: 'started' | string
  coins: number
  startedAt: string
}

interface GameSessionFinishResponse {
  sessionId: string
  status: 'finished' | string
  result: 'win' | 'lose'
  coins: number
  finishedAt: string
}

interface CatalogResponse {
  catalog: GameCategory[]
}

interface LevelsResponse {
  levels: GameLevelItem[]
}

export const useGamesStore = defineStore('games', {
  state: () => ({
    catalog: [] as GameCategory[],
    levels: [] as GameLevelItem[],
    activeSession: null as GameSessionStartResponse | null,
    loadingCatalog: false,
    loadingLevels: false,
    loadingSession: false,
    error: '' as string,
    catalogFetchedAt: 0,
    levelsFetchedAt: 0,
  }),
  getters: {
    isCatalogCacheValid: (state) =>
      state.catalog.length > 0 && Date.now() - state.catalogFetchedAt < CATALOG_CACHE_TTL_MS,
    isLevelsCacheValid: (state) =>
      state.levels.length > 0 && Date.now() - state.levelsFetchedAt < LEVELS_CACHE_TTL_MS,
  },
  actions: {
    async fetchCatalog(force = false) {
      if (!force && this.isCatalogCacheValid) {
        return this.catalog
      }

      this.loadingCatalog = true
      this.error = ''

      try {
        const response = await $fetch<CatalogResponse>('/api/games/catalog')
        this.catalog = response.catalog
        this.catalogFetchedAt = Date.now()
        return this.catalog
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unable to load game catalog'
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
        const response = await $fetch<LevelsResponse>('/api/games/levels')
        this.levels = response.levels
        this.levelsFetchedAt = Date.now()
        return this.levels
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unable to load game levels'
        throw error
      } finally {
        this.loadingLevels = false
      }
    },
    async startSession(gameId: string, level: string) {
      this.loadingSession = true
      this.error = ''

      try {
        const response = await $fetch<GameSessionStartResponse>(`/api/games/${gameId}/sessions/start`, {
          method: 'POST',
          body: { level },
        })

        this.activeSession = response

        const profileStore = useProfileStore()
        if (profileStore.profile) {
          profileStore.profile.coins = response.coins
        }

        return response
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unable to start game session'
        throw error
      } finally {
        this.loadingSession = false
      }
    },
    async finishSession(sessionId: string, result: 'win' | 'lose') {
      this.loadingSession = true
      this.error = ''

      try {
        const response = await $fetch<GameSessionFinishResponse>(`/api/games/sessions/${sessionId}/finish`, {
          method: 'POST',
          body: { result },
        })

        const profileStore = useProfileStore()
        if (profileStore.profile) {
          profileStore.profile.coins = response.coins
        }

        this.activeSession = null

        return response
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unable to finish game session'
        throw error
      } finally {
        this.loadingSession = false
      }
    },
    clearSession() {
      this.activeSession = null
    },
  },
})
