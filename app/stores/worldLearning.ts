import type {
  LearningAdminAnalytics,
  LearningCourse,
  LearningProgress,
} from '~~/server/types/api/learning'
import type {
  WorldLearningCourseMutationPayload,
  WorldLearningFilters,
  WorldLearningProgressMutationPayload,
  WorldPaginationState,
} from '~/types/world/learning'
import {
  recordStoreCacheEvent,
  runTrackedStoreFetch,
} from '~/utils/storeTelemetry'

const LEARNING_TTL_MS = 4 * 60 * 1000

function buildCacheKey(prefix: string, filters: Record<string, unknown>) {
  const query = Object.entries(filters)
    .filter(
      ([, value]) =>
        value !== undefined && value !== null && String(value).trim() !== '',
    )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join(':')

  return `${prefix}${query ? `:${query}` : ''}`
}

export const useWorldLearningStore = defineStore('world-learning', () => {
  const items = ref<LearningCourse[]>([])
  const detail = ref<LearningAdminAnalytics | null>(null)
  const pending = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<WorldLearningFilters>({})
  const pagination = ref<WorldPaginationState>({
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 1,
  })
  const lastFetchedAt = ref<number | null>(null)

  const progressByCourse = ref<Record<string, LearningProgress[]>>({})
  const cache = ref<Record<string, { fetchedAt: number; data: unknown }>>({})

  function isFresh(entry?: { fetchedAt: number }) {
    return !!entry && Date.now() - entry.fetchedAt < LEARNING_TTL_MS
  }

  function invalidateCache(prefix?: string) {
    if (!prefix) {
      cache.value = {}
      return
    }

    cache.value = Object.fromEntries(
      Object.entries(cache.value).filter(([key]) => !key.startsWith(prefix)),
    )
  }

  async function fetchCourses(options?: { force?: boolean }) {
    const cacheKey = buildCacheKey('learning-courses', filters.value)
    const cached = cache.value[cacheKey]
    if (cached && !options?.force && isFresh(cached)) {
      recordStoreCacheEvent('learning', true)
      items.value = (cached.data as { items: LearningCourse[] }).items
      pagination.value.total = items.value.length
      return
    }
    recordStoreCacheEvent('learning', false)

    pending.value = true
    error.value = null
    try {
      const response = await runTrackedStoreFetch('learning', () =>
        $fetch<{ items: LearningCourse[] }>('/api/world/learning/courses'),
      )
      items.value = response.items
      pagination.value.total = response.items.length
      pagination.value.totalPages = 1
      lastFetchedAt.value = Date.now()
      cache.value[cacheKey] = { fetchedAt: lastFetchedAt.value, data: response }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Unable to fetch learning courses'
      throw err
    } finally {
      pending.value = false
    }
  }

  async function fetchProgress(
    courseId: string,
    options?: { force?: boolean },
  ) {
    if (!courseId) {
      return []
    }

    const cacheKey = `learning-progress:${courseId}`
    const cached = cache.value[cacheKey]
    if (cached && !options?.force && isFresh(cached)) {
      recordStoreCacheEvent('learning', true)
      const data = (cached.data as { items: LearningProgress[] }).items
      progressByCourse.value[courseId] = data
      return data
    }
    recordStoreCacheEvent('learning', false)

    pending.value = true
    error.value = null
    try {
      const response = await runTrackedStoreFetch('learning', () =>
        $fetch<{ items: LearningProgress[] }>(
          `/api/world/learning/courses/${courseId}/progress`,
        ),
      )
      progressByCourse.value[courseId] = response.items
      lastFetchedAt.value = Date.now()
      cache.value[cacheKey] = { fetchedAt: lastFetchedAt.value, data: response }
      return response.items
    } finally {
      pending.value = false
    }
  }

  async function fetchAnalytics(options?: { force?: boolean }) {
    const cacheKey = 'learning-analytics'
    const cached = cache.value[cacheKey]
    if (cached && !options?.force && isFresh(cached)) {
      recordStoreCacheEvent('learning', true)
      detail.value = (cached.data as { items: LearningAdminAnalytics }).items
      return
    }
    recordStoreCacheEvent('learning', false)

    pending.value = true
    error.value = null
    try {
      const response = await runTrackedStoreFetch('learning', () =>
        $fetch<{ items: LearningAdminAnalytics }>('/api/world/learning/analytics'),
      )
      detail.value = response.items
      lastFetchedAt.value = Date.now()
      cache.value[cacheKey] = { fetchedAt: lastFetchedAt.value, data: response }
    } finally {
      pending.value = false
    }
  }

  async function mutateCourses(payload: WorldLearningCourseMutationPayload) {
    pending.value = true
    error.value = null
    try {
      const response = await runTrackedStoreFetch('learning', () =>
        $fetch<{ items: LearningCourse[] }>('/api/world/learning/courses', {
          method: 'POST',
          body: payload,
        }),
      )
      items.value = response.items
      invalidateCache('learning-courses')
      cache.value['learning-courses'] = {
        fetchedAt: Date.now(),
        data: response,
      }
      return response
    } finally {
      pending.value = false
    }
  }

  async function upsertProgress(
    courseId: string,
    payload: WorldLearningProgressMutationPayload,
  ) {
    pending.value = true
    error.value = null
    try {
      const response = await runTrackedStoreFetch('learning', () =>
        $fetch<{ items: LearningProgress[] }>(
          `/api/world/learning/courses/${courseId}/progress`,
          {
            method: 'POST',
            body: payload,
          },
        ),
      )
      progressByCourse.value[courseId] = response.items
      cache.value[`learning-progress:${courseId}`] = {
        fetchedAt: Date.now(),
        data: response,
      }
      invalidateCache('learning-analytics')
      return response
    } finally {
      pending.value = false
    }
  }

  return {
    items,
    detail,
    pending,
    error,
    filters,
    pagination,
    lastFetchedAt,
    progressByCourse,
    fetchCourses,
    fetchProgress,
    fetchAnalytics,
    mutateCourses,
    upsertProgress,
    invalidateCache,
  }
})
