import { defineStore } from 'pinia'
import { useGameCatalogApi } from '~/composables/api/useGameCatalogApi'
import type { ApiGameCategory, GameCategory } from '~/types/game'
import { mapGameCatalogFromApi } from '~/utils/gameCatalogMapper'

export const useGameCatalogStore = defineStore('game-catalog', () => {
  const gameCatalogApi = useGameCatalogApi()

  const categories = ref<GameCategory[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchCatalog = async (force = false) => {
    if (categories.value.length > 0 && !force) {
      return categories.value
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await gameCatalogApi.getPublicGameCatalog()
      const apiCategories: ApiGameCategory[] = Array.isArray(response)
        ? response
        : (response.items ?? [])

      categories.value = mapGameCatalogFromApi(apiCategories)
      return categories.value
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Unable to load game catalog.'
      categories.value = []
      return categories.value
    } finally {
      isLoading.value = false
    }
  }

  return {
    categories,
    isLoading,
    error,
    fetchCatalog,
  }
})
