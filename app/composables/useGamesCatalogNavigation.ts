import { Notify } from '~/stores/notification'

type KeyedEntity = {
  id: string
  key?: string
}

export function useGamesCatalogNavigation() {
  const catalogStore = useGameCatalogStore()
  const { t, te } = useI18n()

  function tOrFallback(key: string, fallback: string) {
    return te(key) ? t(key) : fallback
  }

  async function ensureCatalogLoaded() {
    try {
      await catalogStore.fetchCatalog()
      return true
    } catch (error) {
      Notify.error(error)
      return false
    }
  }

  function matchesRouteParam(entity: KeyedEntity, param: string) {
    return entity.id === param || entity.key === param
  }

  function entityRouteValue(entity: KeyedEntity) {
    return entity.key || entity.id
  }

  function getCategoryByRouteParam(categoryParam: string) {
    return (
      catalogStore.categories.find((category) =>
        matchesRouteParam(category, categoryParam),
      ) ?? null
    )
  }

  function getSubCategoryByRouteParam(
    categoryParam: string,
    subCategoryParam: string,
  ) {
    const category = getCategoryByRouteParam(categoryParam)
    return (
      category?.subCategories.find((subCategory) =>
        matchesRouteParam(subCategory, subCategoryParam),
      ) ?? null
    )
  }

  function getGameByRouteParam(
    categoryParam: string,
    subCategoryParam: string,
    gameParam: string,
  ) {
    const subCategory = getSubCategoryByRouteParam(
      categoryParam,
      subCategoryParam,
    )
    return (
      subCategory?.games.find((game) => matchesRouteParam(game, gameParam)) ??
      null
    )
  }

  function getGameCardImage(thumbnailUrl?: string | null) {
    return (
      thumbnailUrl ||
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80'
    )
  }

  function entityName(entity: {
    name?: string
    key?: string
    nameKey?: string
    id?: string
  }) {
    return tOrFallback(
      entity.nameKey ?? '',
      entity.key ?? entity.name ?? entity.id ?? '',
    )
  }

  function entityDescription(entity: {
    description?: string | null
    descriptionKey?: string
  }) {
    return tOrFallback(entity.descriptionKey ?? '', entity.description ?? '')
  }

  return {
    catalogStore,
    t,
    te,
    tOrFallback,
    ensureCatalogLoaded,
    getCategoryByRouteParam,
    getSubCategoryByRouteParam,
    getGameByRouteParam,
    getGameCardImage,
    entityRouteValue,
    entityName,
    entityDescription,
  }
}
