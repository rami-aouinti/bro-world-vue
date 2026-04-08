import { Notify } from '~/stores/notification'

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

  function getCategoryById(categoryId: string) {
    return catalogStore.categories.find(category => category.id === categoryId) ?? null
  }

  function getSubCategoryById(categoryId: string, subCategoryId: string) {
    const category = getCategoryById(categoryId)
    return category?.subCategories.find(subCategory => subCategory.id === subCategoryId) ?? null
  }

  function getGameCardImage(thumbnailUrl?: string | null) {
    return thumbnailUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80'
  }

  function entityName(entity: { name?: string; key?: string; nameKey?: string; id?: string }) {
    return tOrFallback(entity.nameKey ?? '', entity.key ?? entity.name ?? entity.id ?? '')
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
    getCategoryById,
    getSubCategoryById,
    getGameCardImage,
    entityName,
    entityDescription,
  }
}
