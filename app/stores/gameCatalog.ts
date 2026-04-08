const CATALOG_TTL_MS = 5 * 60 * 1000
const LEVELS_TTL_MS = 15 * 60 * 1000

interface GameItem {
  id: string
  name?: string
  key?: string
  nameKey?: string
  description?: string | null
  descriptionKey?: string
  thumbnailUrl?: string | null
  img?: string | null
  icon?: string | null
  component?: string | null
  enabled?: boolean
}

interface GameSubCategory {
  id: string
  name?: string
  key?: string
  nameKey?: string
  description?: string | null
  descriptionKey?: string
  thumbnailUrl?: string | null
  img?: string | null
  icon?: string | null
  games: GameItem[]
}

interface GameCategory {
  id: string
  name?: string
  key?: string
  nameKey?: string
  description?: string | null
  descriptionKey?: string
  thumbnailUrl?: string | null
  img?: string | null
  icon?: string | null
  subCategories: GameSubCategory[]
  games?: GameItem[]
}

function normalizeGameItem(raw: unknown): GameItem | null {
  if (!raw || typeof raw !== 'object')
    return null

  const item = raw as Record<string, unknown>
  if (typeof item.id !== 'string')
    return null

  return {
    id: item.id,
    name: typeof item.name === 'string' ? item.name : undefined,
    key: typeof item.key === 'string' ? item.key : undefined,
    nameKey: typeof item.nameKey === 'string' ? item.nameKey : undefined,
    description: typeof item.description === 'string' ? item.description : null,
    descriptionKey: typeof item.descriptionKey === 'string' ? item.descriptionKey : undefined,
    thumbnailUrl: typeof item.thumbnailUrl === 'string' ? item.thumbnailUrl : null,
    img: typeof item.img === 'string' ? item.img : null,
    icon: typeof item.icon === 'string' ? item.icon : null,
    component: typeof item.component === 'string' ? item.component : null,
    enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
  }
}

function normalizeSubCategory(raw: unknown): GameSubCategory | null {
  if (!raw || typeof raw !== 'object')
    return null

  const sub = raw as Record<string, unknown>
  if (typeof sub.id !== 'string')
    return null

  const games = Array.isArray(sub.games)
    ? sub.games.map(normalizeGameItem).filter((game): game is GameItem => game !== null)
    : []

  return {
    id: sub.id,
    name: typeof sub.name === 'string' ? sub.name : undefined,
    key: typeof sub.key === 'string' ? sub.key : undefined,
    nameKey: typeof sub.nameKey === 'string' ? sub.nameKey : undefined,
    description: typeof sub.description === 'string' ? sub.description : null,
    descriptionKey: typeof sub.descriptionKey === 'string' ? sub.descriptionKey : undefined,
    thumbnailUrl: typeof sub.thumbnailUrl === 'string' ? sub.thumbnailUrl : null,
    img: typeof sub.img === 'string' ? sub.img : null,
    icon: typeof sub.icon === 'string' ? sub.icon : null,
    games,
  }
}

function normalizeCatalog(response: unknown): GameCategory[] {
  if (!Array.isArray(response))
    return []

  return response
    .map((entry) => {
      if (!entry || typeof entry !== 'object')
        return null

      const category = entry as Record<string, unknown>
      if (typeof category.id !== 'string')
        return null

      const subCategories = Array.isArray(category.subCategories)
        ? category.subCategories
            .map(normalizeSubCategory)
            .filter((subCategory): subCategory is GameSubCategory => subCategory !== null)
        : []

      const games = Array.isArray(category.games)
        ? category.games.map(normalizeGameItem).filter((game): game is GameItem => game !== null)
        : []

      return {
        id: category.id,
        name: typeof category.name === 'string' ? category.name : undefined,
        key: typeof category.key === 'string' ? category.key : undefined,
        nameKey: typeof category.nameKey === 'string' ? category.nameKey : undefined,
        description: typeof category.description === 'string' ? category.description : null,
        descriptionKey: typeof category.descriptionKey === 'string' ? category.descriptionKey : undefined,
        thumbnailUrl: typeof category.thumbnailUrl === 'string' ? category.thumbnailUrl : null,
        img: typeof category.img === 'string' ? category.img : null,
        icon: typeof category.icon === 'string' ? category.icon : null,
        subCategories,
        games,
      } as GameCategory
    })
    .filter((category): category is GameCategory => category !== null)
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
        const response = await $fetch<unknown>('/api/games/catalog')
        this.categories = normalizeCatalog(response)
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
