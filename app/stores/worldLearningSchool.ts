const SCHOOL_STORE_TTL_MS = 2 * 60 * 1000

export type SchoolResource = 'exams' | 'classes' | 'teachers' | 'students' | 'grades'

type SchoolCollectionResponse = { items: Record<string, unknown>[] }
type SchoolItemResponse = { item: Record<string, unknown> }

function normalizeSchoolResource(resource: string): SchoolResource {
  const value = resource.trim().toLowerCase()
  if (value === 'exams' || value === 'classes' || value === 'teachers' || value === 'students' || value === 'grades') {
    return value
  }

  throw new Error(`Unsupported school resource: ${resource}`)
}

export const useWorldLearningSchoolStore = defineStore('world-learning-school', () => {
  const collections = ref<Record<string, Record<string, unknown>[]>>({})
  const details = ref<Record<string, Record<string, unknown>>>({})
  const loadingKeys = ref<Record<string, boolean>>({})
  const error = ref<string | null>(null)
  const cache = ref<Record<string, { at: number; data: unknown }>>({})

  function isFresh(cacheKey: string) {
    const cached = cache.value[cacheKey]
    return !!cached && Date.now() - cached.at < SCHOOL_STORE_TTL_MS
  }

  async function fetchCollection(resourceRaw: string, options?: { force?: boolean }) {
    const resource = normalizeSchoolResource(resourceRaw)
    const cacheKey = `collection:${resource}`

    if (!options?.force && isFresh(cacheKey)) {
      collections.value[resource] = cache.value[cacheKey].data as Record<string, unknown>[]
      return collections.value[resource]
    }

    loadingKeys.value[cacheKey] = true
    error.value = null
    try {
      const response = await $fetch<SchoolCollectionResponse>(`/api/world/learning/public/school/${resource}`)
      collections.value[resource] = response.items
      cache.value[cacheKey] = { at: Date.now(), data: response.items }
      return response.items
    } catch (err) {
      error.value = err instanceof Error ? err.message : `Unable to load ${resource}`
      throw err
    } finally {
      loadingKeys.value[cacheKey] = false
    }
  }

  async function fetchDetail(resourceRaw: string, id: string, options?: { force?: boolean }) {
    const resource = normalizeSchoolResource(resourceRaw)
    const cacheKey = `detail:${resource}:${id}`

    if (!id) {
      return null
    }

    if (!options?.force && isFresh(cacheKey)) {
      details.value[cacheKey] = cache.value[cacheKey].data as Record<string, unknown>
      return details.value[cacheKey]
    }

    loadingKeys.value[cacheKey] = true
    error.value = null
    try {
      const response = await $fetch<SchoolItemResponse>(`/api/world/learning/public/school/${resource}/${id}`)
      details.value[cacheKey] = response.item
      cache.value[cacheKey] = { at: Date.now(), data: response.item }
      return response.item
    } catch (err) {
      error.value = err instanceof Error ? err.message : `Unable to load ${resource} detail`
      throw err
    } finally {
      loadingKeys.value[cacheKey] = false
    }
  }

  function getCollection(resourceRaw: string) {
    const resource = normalizeSchoolResource(resourceRaw)
    return collections.value[resource] ?? []
  }

  function getDetail(resourceRaw: string, id: string) {
    const resource = normalizeSchoolResource(resourceRaw)
    return details.value[`detail:${resource}:${id}`] ?? null
  }

  function isLoading(resourceRaw: string, id?: string) {
    const resource = normalizeSchoolResource(resourceRaw)
    const key = id ? `detail:${resource}:${id}` : `collection:${resource}`
    return Boolean(loadingKeys.value[key])
  }

  return {
    collections,
    details,
    error,
    fetchCollection,
    fetchDetail,
    getCollection,
    getDetail,
    isLoading,
  }
})
