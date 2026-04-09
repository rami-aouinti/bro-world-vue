const CATALOG_TTL_MS = 5 * 60 * 1000
const LEVELS_TTL_MS = 15 * 60 * 1000

function normalizeSessionLevel(level: string) {
  const normalizedLevel = level.trim().toLowerCase()

  if (normalizedLevel === 'beginner') return 'easy'

  if (normalizedLevel === 'intermediate' || normalizedLevel === 'intermidiate')
    return 'medium'

  if (normalizedLevel === 'advanced') return 'hard'

  return normalizedLevel
}

function normalizeSurfaceComponentValue(rawValue: unknown) {
  if (typeof rawValue !== 'string') return null

  const normalized = rawValue.replace(/[^a-z0-9]/gi, '').toLowerCase()
  if (!normalized) return null

  const aliasMap: Record<string, string> = {
    checkers: 'checkerssurface',
    checkerstable: 'checkerssurface',
    uno: 'unosurface',
    rami: 'ramisurface',
    ramitable: 'ramisurface',
    poker: 'pokertablesurface',
    pokertable: 'pokertablesurface',
    belote: 'belotetablesurface',
    belotetable: 'belotetablesurface',
  }

  return aliasMap[normalized] || normalized
}

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
  minPlayers?: number
  maxPlayers?: number
  allowedPlayerCounts?: number[]
  supportsAiOpponent?: boolean
  requiresOpponent?: boolean
  playSurfaceComponent?: string | null
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

function normalizeAllowedPlayerCounts(
  raw: unknown,
  minPlayers: number,
  maxPlayers: number,
) {
  if (!Array.isArray(raw)) {
    return Array.from(
      { length: Math.max(1, maxPlayers - minPlayers + 1) },
      (_, index) => minPlayers + index,
    )
  }

  const normalized = raw
    .filter((value): value is number => typeof value === 'number')
    .filter((value) => Number.isFinite(value) && Number.isInteger(value))
    .filter((value) => value >= minPlayers && value <= maxPlayers)
    .sort((a, b) => a - b)
    .filter((value, index, values) => values.indexOf(value) === index)

  return normalized.length
    ? normalized
    : Array.from(
        { length: Math.max(1, maxPlayers - minPlayers + 1) },
        (_, index) => minPlayers + index,
      )
}

function normalizeGameItem(raw: unknown): GameItem | null {
  if (!raw || typeof raw !== 'object') return null

  const item = raw as Record<string, unknown>
  if (typeof item.id !== 'string') return null

  const minPlayers =
    typeof item.minPlayers === 'number' &&
    Number.isFinite(item.minPlayers) &&
    Number.isInteger(item.minPlayers) &&
    item.minPlayers > 0
      ? item.minPlayers
      : 1
  const maxPlayers =
    typeof item.maxPlayers === 'number' &&
    Number.isFinite(item.maxPlayers) &&
    Number.isInteger(item.maxPlayers) &&
    item.maxPlayers >= minPlayers
      ? item.maxPlayers
      : minPlayers
  const allowedPlayerCounts = normalizeAllowedPlayerCounts(
    item.allowedPlayerCounts,
    minPlayers,
    maxPlayers,
  )

  return {
    id: item.id,
    name: typeof item.name === 'string' ? item.name : undefined,
    key: typeof item.key === 'string' ? item.key : undefined,
    nameKey: typeof item.nameKey === 'string' ? item.nameKey : undefined,
    description: typeof item.description === 'string' ? item.description : null,
    descriptionKey:
      typeof item.descriptionKey === 'string' ? item.descriptionKey : undefined,
    thumbnailUrl:
      typeof item.thumbnailUrl === 'string' ? item.thumbnailUrl : null,
    img: typeof item.img === 'string' ? item.img : null,
    icon: typeof item.icon === 'string' ? item.icon : null,
    component: normalizeSurfaceComponentValue(item.component),
    enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
    minPlayers,
    maxPlayers,
    allowedPlayerCounts,
    supportsAiOpponent:
      typeof item.supportsAiOpponent === 'boolean'
        ? item.supportsAiOpponent
        : false,
    requiresOpponent:
      typeof item.requiresOpponent === 'boolean' ? item.requiresOpponent : false,
    playSurfaceComponent:
      normalizeSurfaceComponentValue(item.playSurfaceComponent) ||
      normalizeSurfaceComponentValue(item.component) ||
      normalizeSurfaceComponentValue(item.key) ||
      normalizeSurfaceComponentValue(item.id),
  }
}

function normalizeSubCategory(raw: unknown): GameSubCategory | null {
  if (!raw || typeof raw !== 'object') return null

  const sub = raw as Record<string, unknown>
  if (typeof sub.id !== 'string') return null

  const games = Array.isArray(sub.games)
    ? sub.games
        .map(normalizeGameItem)
        .filter((game): game is GameItem => game !== null)
    : []

  return {
    id: sub.id,
    name: typeof sub.name === 'string' ? sub.name : undefined,
    key: typeof sub.key === 'string' ? sub.key : undefined,
    nameKey: typeof sub.nameKey === 'string' ? sub.nameKey : undefined,
    description: typeof sub.description === 'string' ? sub.description : null,
    descriptionKey:
      typeof sub.descriptionKey === 'string' ? sub.descriptionKey : undefined,
    thumbnailUrl:
      typeof sub.thumbnailUrl === 'string' ? sub.thumbnailUrl : null,
    img: typeof sub.img === 'string' ? sub.img : null,
    icon: typeof sub.icon === 'string' ? sub.icon : null,
    games,
  }
}

function normalizeCatalog(response: unknown): GameCategory[] {
  if (!Array.isArray(response)) return []

  return response
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null

      const category = entry as Record<string, unknown>
      if (typeof category.id !== 'string') return null

      const subCategories = Array.isArray(category.subCategories)
        ? category.subCategories
            .map(normalizeSubCategory)
            .filter(
              (subCategory): subCategory is GameSubCategory =>
                subCategory !== null,
            )
        : []

      const games = Array.isArray(category.games)
        ? category.games
            .map(normalizeGameItem)
            .filter((game): game is GameItem => game !== null)
        : []

      return {
        id: category.id,
        name: typeof category.name === 'string' ? category.name : undefined,
        key: typeof category.key === 'string' ? category.key : undefined,
        nameKey:
          typeof category.nameKey === 'string' ? category.nameKey : undefined,
        description:
          typeof category.description === 'string'
            ? category.description
            : null,
        descriptionKey:
          typeof category.descriptionKey === 'string'
            ? category.descriptionKey
            : undefined,
        thumbnailUrl:
          typeof category.thumbnailUrl === 'string'
            ? category.thumbnailUrl
            : null,
        img: typeof category.img === 'string' ? category.img : null,
        icon: typeof category.icon === 'string' ? category.icon : null,
        subCategories,
        games,
      } as GameCategory
    })
    .filter((category): category is GameCategory => category !== null)
}

type LevelItem = {
  id: string
  value: string
  label: string
  description: string
}

type CatalogResponse = GameCategory[] | { catalog?: unknown }

type LevelsResponse = { items?: unknown; levels?: unknown }

type StartSessionPayload = {
  level: string
  mode: 'solo' | 'versus' | 'team' | 'table'
  playerCount: number
  opponentType: 'none' | 'human_online' | 'ai_bot'
  seatCount?: number
  allowedPlayerCounts?: number[]
}

type StartApiSession = {
  id?: string
  sessionId?: string
  gameId?: string
  level?: string
  status?: string
  startedAt?: string
  context?: {
    selectedLevel?: string
    mode?: 'solo' | 'versus' | 'team' | 'table'
    playerCount?: number
    opponentType?: 'none' | 'human_online' | 'ai_bot'
    seatCount?: number
    allowedPlayerCounts?: number[]
    seats?: Array<{
      seat: number
      teamKey?: string | null
      playerId?: string | null
      isCurrentPlayer?: boolean
    }>
  }
}

type StartResponse =
  | {
      session: StartApiSession
      userGameId?: string
      coins?: number
    }
  | {
      sessionId?: string
      gameId?: string
      level?: string
      status?: string
      userGameId?: string
      coins?: number
    }

type FinishResponse =
  | {
      userGame?: {
        id?: string
        sessionId?: string
        gameId?: string
        level?: string
        selectedLevel?: string
        status?: string
        result?: 'win' | 'lose'
        finishedAt?: string
      }
      status?: string
      coins?: number
    }
  | {
      sessionId?: string
      status?: string
      result?: 'win' | 'lose'
      coins?: number
      finishedAt?: string
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

function buildHttpError(
  error: unknown,
  fallbackMessage: string,
): HttpErrorLike {
  const source =
    error instanceof Error
      ? (error as HttpErrorLike)
      : (new Error(fallbackMessage) as HttpErrorLike)
  const status = source.status ?? source.statusCode ?? source.response?.status
  const statusSuffix = status ? ` (HTTP ${status})` : ''
  const message = `${source.message || fallbackMessage}${statusSuffix}`
  const enriched = new Error(message) as HttpErrorLike
  enriched.status = status
  return enriched
}

function normalizeCatalogResponse(response: CatalogResponse): GameCategory[] {
  const source =
    Array.isArray(response) || !response || typeof response !== 'object'
      ? response
      : response.catalog
  return normalizeCatalog(source)
}

function normalizeLevelsResponse(response: LevelsResponse): LevelItem[] {
  const source = Array.isArray(response.items)
    ? response.items
    : Array.isArray(response.levels)
      ? response.levels
      : []

  return source
    .filter((level): level is Record<string, unknown> => !!level && typeof level === 'object')
    .map((level) => ({
      id: typeof level.id === 'string' ? level.id : String(level.value ?? ''),
      value:
        typeof level.value === 'string'
          ? level.value
          : typeof level.id === 'string'
            ? level.id
            : '',
      label:
        typeof level.label === 'string'
          ? level.label
          : typeof level.value === 'string'
            ? level.value
            : typeof level.id === 'string'
              ? level.id
              : '',
      description: typeof level.description === 'string' ? level.description : '',
    }))
    .filter((level) => level.id && level.value && level.label)
}

function normalizeStartResponse(response: StartResponse, fallbackLevel: string) {
  const session =
    'session' in response
      ? response.session
      : {
          sessionId: response.sessionId,
          gameId: response.gameId,
          level: response.level,
          status: response.status,
        }
  const sessionId = session?.id ?? session?.sessionId ?? ''
  const level = session?.level ?? session?.context?.selectedLevel ?? fallbackLevel
  const status = session?.status ?? 'started'
  const coins = typeof response.coins === 'number' ? response.coins : 0
  const userGameId = response.userGameId ?? ''

  return { sessionId, level, status, coins, userGameId }
}

function normalizeFinishResponse(response: FinishResponse) {
  const status =
    ('userGame' in response ? response.userGame?.status : undefined) ??
    response.status ??
    'finished'
  const coins = typeof response.coins === 'number' ? response.coins : 0
  return { status, coins }
}

export const useGameCatalogStore = defineStore('game-catalog', {
  state: () => ({
    categories: [] as GameCategory[],
    levels: [] as LevelItem[],
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
      state.categories.length > 0 &&
      Date.now() - state.catalogFetchedAt < CATALOG_TTL_MS,
    isLevelsCacheValid: (state) =>
      state.levels.length > 0 &&
      Date.now() - state.levelsFetchedAt < LEVELS_TTL_MS,
  },
  actions: {
    async fetchCatalog(force = false) {
      if (!force && this.isCatalogCacheValid) {
        return this.categories
      }

      this.loadingCatalog = true
      this.error = ''

      try {
        const response = await $fetch<CatalogResponse>('/api/games/catalog')
        this.categories = normalizeCatalogResponse(response)
        this.catalogFetchedAt = Date.now()
        return this.categories
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : 'Unable to load game catalog.'
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
        this.levels = normalizeLevelsResponse(response)
        this.levelsFetchedAt = Date.now()
        return this.levels
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Unable to load game levels.'
        throw error
      } finally {
        this.loadingLevels = false
      }
    },
    async startSession(gameId: string, payload: StartSessionPayload) {
      this.startingSession = true
      this.error = ''
      const profileStore = useProfileStore()

      try {
        const response = await $fetch<StartResponse>(
          `/api/games/${gameId}/sessions/start`,
          {
            method: 'POST',
            body: {
              ...payload,
              level: normalizeSessionLevel(payload.level),
            },
          },
        )

        const normalizedResponse = normalizeStartResponse(response, payload.level)

        if (!normalizedResponse.sessionId) {
          throw new Error(
            'Unable to start session: missing session id in API response.',
          )
        }

        this.currentSession = {
          sessionId: normalizedResponse.sessionId,
          status: normalizedResponse.status,
          coins: normalizedResponse.coins,
          level: normalizedResponse.level,
          userGameId: normalizedResponse.userGameId,
        }
        if (profileStore.profile) {
          profileStore.profile.coins = normalizedResponse.coins
        }
        return normalizedResponse
      } catch (error) {
        const httpError = buildHttpError(error, 'Unable to start session.')

        if (httpError.status === 401) {
          const { $i18n } = useNuxtApp()
          const authRequiredMessage = $i18n?.t('gamePage.session.authRequired')
          const localizedAuthRequiredMessage =
            typeof authRequiredMessage === 'string' &&
            authRequiredMessage !== 'gamePage.session.authRequired'
              ? authRequiredMessage
              : 'You must be logged in to start a game.'
          const unauthorizedError = new Error(
            localizedAuthRequiredMessage,
          ) as HttpErrorLike
          unauthorizedError.status = 401
          this.error = unauthorizedError.message
          throw unauthorizedError
        }

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
        const response = await $fetch<FinishResponse>(
          `/api/games/sessions/${sessionId}/finish`,
          {
            method: 'POST',
            body: { result },
          },
        )
        const normalizedResponse = normalizeFinishResponse(response)

        if (this.currentSession) {
          this.currentSession = {
            ...this.currentSession,
            status: normalizedResponse.status,
            coins: normalizedResponse.coins,
          }
        }
        if (profileStore.profile) {
          profileStore.profile.coins = normalizedResponse.coins
        }
        return normalizedResponse
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
