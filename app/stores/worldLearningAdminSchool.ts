export interface LearningAdminSchoolClass {
  id: string
  name: string
  schoolId: string
}

export interface LearningAdminSchoolSummaryItem {
  key: string
  label: string
  count: number
}

const CACHE_TTL_MS = 2 * 60 * 1000

export const useWorldLearningAdminSchoolStore = defineStore(
  'world-learning-admin-school',
  () => {
    const summary = ref<LearningAdminSchoolSummaryItem[]>([])
    const classes = ref<LearningAdminSchoolClass[]>([])
    const selectedClass = ref<LearningAdminSchoolClass | null>(null)
    const pending = ref(false)
    const error = ref<string | null>(null)

    const cache = ref<Record<string, { at: number; data: unknown }>>({})

    const isFresh = (key: string) => {
      const entry = cache.value[key]
      return !!entry && Date.now() - entry.at < CACHE_TTL_MS
    }

    const invalidate = (prefix?: string) => {
      if (!prefix) {
        cache.value = {}
        return
      }

      cache.value = Object.fromEntries(
        Object.entries(cache.value).filter(([key]) => !key.startsWith(prefix)),
      )
    }

    async function fetchSummary(options?: { force?: boolean }) {
      const cacheKey = 'summary'
      if (!options?.force && isFresh(cacheKey)) {
        summary.value = cache.value[cacheKey].data as LearningAdminSchoolSummaryItem[]
        return summary.value
      }

      pending.value = true
      error.value = null
      try {
        const response = await $fetch<{ items: LearningAdminSchoolSummaryItem[] }>(
          '/api/world/learning/admin/school/summary',
        )
        summary.value = response.items
        cache.value[cacheKey] = { at: Date.now(), data: response.items }
        return response.items
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Unable to load summary'
        throw err
      } finally {
        pending.value = false
      }
    }

    async function fetchClasses(options?: { force?: boolean }) {
      const cacheKey = 'classes:list'
      if (!options?.force && isFresh(cacheKey)) {
        classes.value = cache.value[cacheKey].data as LearningAdminSchoolClass[]
        return classes.value
      }

      pending.value = true
      error.value = null
      try {
        const response = await $fetch<{ items: LearningAdminSchoolClass[] }>(
          '/api/world/learning/admin/school/classes',
        )
        classes.value = response.items
        cache.value[cacheKey] = { at: Date.now(), data: response.items }
        return response.items
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Unable to load classes'
        throw err
      } finally {
        pending.value = false
      }
    }

    async function fetchClass(id: string, options?: { force?: boolean }) {
      if (!id) return null
      const cacheKey = `classes:item:${id}`
      if (!options?.force && isFresh(cacheKey)) {
        selectedClass.value = cache.value[cacheKey].data as LearningAdminSchoolClass
        return selectedClass.value
      }

      pending.value = true
      error.value = null
      try {
        const response = await $fetch<{ item: LearningAdminSchoolClass }>(
          `/api/world/learning/admin/school/classes/${id}`,
        )
        selectedClass.value = response.item
        cache.value[cacheKey] = { at: Date.now(), data: response.item }
        return response.item
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Unable to load class details'
        throw err
      } finally {
        pending.value = false
      }
    }

    async function createClass(payload: { name: string; schoolId: string }) {
      pending.value = true
      error.value = null
      try {
        const response = await $fetch<{ item: LearningAdminSchoolClass }>(
          '/api/world/learning/admin/school/classes',
          { method: 'POST', body: payload },
        )
        invalidate('classes:')
        invalidate('summary')
        await Promise.all([fetchClasses({ force: true }), fetchSummary({ force: true })])
        return response.item
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Unable to create class'
        throw err
      } finally {
        pending.value = false
      }
    }

    async function updateClass(
      id: string,
      payload: { name?: string; schoolId?: string },
    ) {
      pending.value = true
      error.value = null
      try {
        const response = await $fetch<{ item: LearningAdminSchoolClass }>(
          `/api/world/learning/admin/school/classes/${id}`,
          { method: 'PATCH', body: payload },
        )
        invalidate('classes:')
        invalidate('summary')
        await Promise.all([fetchClasses({ force: true }), fetchSummary({ force: true })])
        return response.item
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Unable to update class'
        throw err
      } finally {
        pending.value = false
      }
    }

    async function removeClass(id: string) {
      pending.value = true
      error.value = null
      try {
        await $fetch(`/api/world/learning/admin/school/classes/${id}`, {
          method: 'DELETE',
        })
        invalidate('classes:')
        invalidate('summary')
        await Promise.all([fetchClasses({ force: true }), fetchSummary({ force: true })])
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Unable to delete class'
        throw err
      } finally {
        pending.value = false
      }
    }

    return {
      summary,
      classes,
      selectedClass,
      pending,
      error,
      fetchSummary,
      fetchClasses,
      fetchClass,
      createClass,
      updateClass,
      removeClass,
      invalidate,
    }
  },
)
