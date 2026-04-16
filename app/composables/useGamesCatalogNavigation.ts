import { Notify } from '~/stores/notification'

type KeyedEntity = {
  id: string
  key?: string
}

type NameLikeEntity = {
  name?: string
  key?: string
  nameKey?: string
  id?: string
}

type DescriptionLikeEntity = {
  description?: string | null
  descriptionKey?: string
}

const DEFAULT_GAME_CARD_IMAGE =
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80'

export function useGamesCatalogNavigation() {
  const catalogStore = useGameCatalogStore()
  const { t, te } = useI18n()

  const categoriesByRouteParam = computed(() => {
    const index = new Map<string, (typeof catalogStore.categories)[number]>()

    for (const category of catalogStore.categories) {
      index.set(category.id, category)

      if (category.key) {
        index.set(category.key, category)
      }
    }

    return index
  })

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

  function findByRouteParam<T extends KeyedEntity>(
    entities: readonly T[],
    param: string,
  ): T | null {
    for (const entity of entities) {
      if (entity.id === param || entity.key === param) {
        return entity
      }
    }

    return null
  }

  function entityRouteValue(entity: KeyedEntity) {
    return entity.key || entity.id
  }

  function getCategoryByRouteParam(categoryParam: string) {
    return categoriesByRouteParam.value.get(categoryParam) ?? null
  }

  function getSubCategoryByRouteParam(
    categoryParam: string,
    subCategoryParam: string,
  ) {
    const category = getCategoryByRouteParam(categoryParam)

    if (!category) {
      return null
    }

    return findByRouteParam(category.subCategories, subCategoryParam)
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

    if (!subCategory) {
      return null
    }

    return findByRouteParam(subCategory.games, gameParam)
  }

  function getGameCardImage(thumbnailUrl?: string | null) {
    return thumbnailUrl || DEFAULT_GAME_CARD_IMAGE
  }

  function entityName(entity: NameLikeEntity) {
    return tOrFallback(
      entity.nameKey ?? '',
      entity.key ?? entity.name ?? entity.id ?? '',
    )
  }

  function entityDescription(entity: DescriptionLikeEntity) {
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
