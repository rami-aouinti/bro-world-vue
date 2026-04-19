import type { AdminSectionKey } from '~/constants/adminManagement'

type CacheEntry = {
  fetchedAt: number
  rows: Record<string, unknown>[]
  count: number
}

const ADMIN_TTL_MS = 60 * 1000

export const useAdminManagementStore = defineStore('admin-management', () => {
  const rowsBySection = ref<Record<AdminSectionKey, Record<string, unknown>[]>>({
    users: [],
    'user-groups': [],
    roles: [],
    'api-keys': [],
    pages: [],
    configurations: [],
    platforms: [],
    plugins: [],
  })

  const countBySection = ref<Record<AdminSectionKey, number>>({
    users: 0,
    'user-groups': 0,
    roles: 0,
    'api-keys': 0,
    pages: 0,
    configurations: 0,
    platforms: 0,
    plugins: 0,
  })

  const pending = ref(false)
  const error = ref<string | null>(null)
  const cache = ref<Record<string, CacheEntry>>({})

  function cacheKey(section: AdminSectionKey, query?: string) {
    return `${section}:${query || 'default'}`
  }

  function setRows(section: AdminSectionKey, rows: Record<string, unknown>[]) {
    rowsBySection.value[section] = rows
  }

  function setCount(section: AdminSectionKey, count: number) {
    countBySection.value[section] = count
  }

  async function fetchSection(
    section: AdminSectionKey,
    options?: { force?: boolean; query?: string },
  ) {
    const key = cacheKey(section, options?.query)
    const cached = cache.value[key]

    if (
      cached &&
      !options?.force &&
      Date.now() - cached.fetchedAt < ADMIN_TTL_MS
    ) {
      setRows(section, cached.rows)
      setCount(section, cached.count)
      return
    }

    pending.value = true
    error.value = null

    try {
      const query = options?.query?.trim()
      const [rows, countResponse] = await Promise.all([
        $fetch<Record<string, unknown>[]>(`/api/admin/management/${section}`, {
          query: query ? { search: query } : undefined,
        }),
        $fetch<{ count: number }>(`/api/admin/management/${section}/count`),
      ])

      setRows(section, rows)
      setCount(section, Number(countResponse?.count ?? rows.length ?? 0))

      cache.value[key] = {
        fetchedAt: Date.now(),
        rows,
        count: Number(countResponse?.count ?? rows.length ?? 0),
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Unable to load admin data'
      throw err
    } finally {
      pending.value = false
    }
  }

  function invalidateSection(section: AdminSectionKey) {
    cache.value = Object.fromEntries(
      Object.entries(cache.value).filter(
        ([key]) => !key.startsWith(`${section}:`),
      ),
    )
  }

  async function createItem(section: AdminSectionKey, payload: Record<string, unknown>) {
    await $fetch(`/api/admin/management/${section}`, {
      method: 'POST',
      body: payload,
    })

    invalidateSection(section)
    await fetchSection(section, { force: true })
  }

  async function updateItem(
    section: AdminSectionKey,
    id: string,
    payload: Record<string, unknown>,
  ) {
    await $fetch(`/api/admin/management/${section}/${id}`, {
      method: 'PATCH',
      body: payload,
    })

    invalidateSection(section)
    await fetchSection(section, { force: true })
  }

  async function deleteItem(section: AdminSectionKey, id: string) {
    await $fetch(`/api/admin/management/${section}/${id}`, {
      method: 'DELETE',
    })

    invalidateSection(section)
    await fetchSection(section, { force: true })
  }

  return {
    rowsBySection,
    countBySection,
    pending,
    error,
    fetchSection,
    createItem,
    updateItem,
    deleteItem,
  }
})
