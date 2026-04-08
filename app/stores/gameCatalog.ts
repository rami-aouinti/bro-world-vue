interface GameItem {
  id: string
  name: string
  description?: string
}

interface SubCategoryItem {
  id: string
  name: string
  games: GameItem[]
}

interface CategoryItem {
  id: string
  name: string
  subCategories: SubCategoryItem[]
}

interface StartSessionPayload {
  sessionId: string
  status: string
  coins: number
}

interface FinishSessionPayload {
  sessionId: string
  status: string
  coins: number
  result: 'win' | 'lose'
}

interface CatalogResponse {
  categories: CategoryItem[]
  levels: string[]
}

const fallbackCatalog: CatalogResponse = {
  categories: [
    {
      id: 'logic',
      name: 'Logic',
      subCategories: [
        {
          id: 'memory',
          name: 'Memory',
          games: [
            { id: 'pairs', name: 'Pairs' },
            { id: 'sequence', name: 'Sequence Sprint' },
          ],
        },
      ],
    },
  ],
  levels: ['easy', 'medium', 'hard'],
}

export const useGameCatalogStore = defineStore('game-catalog', {
  state: () => ({
    categories: [] as CategoryItem[],
    levels: [] as string[],
    currentSession: null as StartSessionPayload | null,
    loadingCatalog: false,
    startingSession: false,
    finishingSession: false,
    error: '' as string,
  }),
  actions: {
    async fetchCatalog() {
      this.loadingCatalog = true
      this.error = ''

      try {
        const response = await $fetch<CatalogResponse>('/api/games/catalog')
        this.categories = response.categories
        this.levels = response.levels
      } catch {
        this.categories = fallbackCatalog.categories
        this.levels = fallbackCatalog.levels
        this.error = 'API unavailable. Showing fallback catalog.'
      } finally {
        this.loadingCatalog = false
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
        this.currentSession = response
        return response
      } catch {
        const fallback = {
          sessionId: crypto.randomUUID(),
          status: 'started',
          coins: 0,
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
        }
        this.error = 'Finish API unavailable. Demo result applied locally.'
        return fallback
      } finally {
        this.finishingSession = false
      }
    },
  },
})

export type { CategoryItem, SubCategoryItem, GameItem, StartSessionPayload, FinishSessionPayload }
