import type {
  CrmAdminApiResponse,
  CrmCompany,
  CrmPipelineApiResponse,
  CrmProject,
} from '~~/server/types/api/crm'
import type {
  WorldCrmCompaniesListResponse,
  WorldCrmFilters,
  WorldCrmProjectsListResponse,
  WorldCrmTransitionPayload,
  WorldPaginationState,
} from '~/types/world/crm'

type CrmListKind = 'projects' | 'companies'

const CRM_TTL_MS = 3 * 60 * 1000

function buildCacheKey(
  prefix: string,
  pagination: WorldPaginationState,
  filters: Record<string, unknown>,
) {
  const normalizedFilters = Object.entries(filters)
    .filter(
      ([, value]) =>
        value !== undefined && value !== null && String(value).trim() !== '',
    )
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join(':')

  return `${prefix}:page=${pagination.page}:limit=${pagination.limit}${normalizedFilters ? `:${normalizedFilters}` : ''}`
}

export const useWorldCrmStore = defineStore('world-crm', () => {
  const items = ref<Array<CrmProject | CrmCompany>>([])
  const detail = ref<CrmPipelineApiResponse | CrmAdminApiResponse | null>(null)
  const pending = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<WorldCrmFilters>({ sortBy: 'id', sortOrder: 'asc' })
  const pagination = ref<WorldPaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })
  const lastFetchedAt = ref<number | null>(null)

  const cache = ref<Record<string, { fetchedAt: number; data: unknown }>>({})

  function isFresh(entry?: { fetchedAt: number }) {
    return !!entry && Date.now() - entry.fetchedAt < CRM_TTL_MS
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

  async function fetchList(
    kind: CrmListKind,
    options?: {
      force?: boolean
      filters?: Partial<WorldCrmFilters>
      pagination?: Partial<WorldPaginationState>
    },
  ) {
    pending.value = true
    error.value = null

    filters.value = { ...filters.value, ...(options?.filters ?? {}) }
    pagination.value = { ...pagination.value, ...(options?.pagination ?? {}) }

    const key = buildCacheKey(`crm-${kind}`, pagination.value, filters.value)
    const cached = cache.value[key]

    if (cached && !options?.force && isFresh(cached)) {
      const data = cached.data as
        | WorldCrmProjectsListResponse
        | WorldCrmCompaniesListResponse
      items.value = data.items
      pagination.value = {
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      }
      lastFetchedAt.value = cached.fetchedAt
      pending.value = false
      return
    }

    try {
      const query = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        sortBy: filters.value.sortBy,
        sortOrder: filters.value.sortOrder,
        search: filters.value.search,
        manager: filters.value.manager,
        phase: filters.value.phase,
        industry: filters.value.industry,
        health: filters.value.health,
      }
      const endpoint =
        kind === 'projects'
          ? '/api/world/crm/projects'
          : '/api/world/crm/companies'
      const response = await $fetch<
        WorldCrmProjectsListResponse | WorldCrmCompaniesListResponse
      >(endpoint, { query })

      items.value = response.items
      pagination.value = {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      }
      lastFetchedAt.value = Date.now()
      cache.value[key] = { fetchedAt: lastFetchedAt.value, data: response }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Unable to fetch CRM list'
      throw err
    } finally {
      pending.value = false
    }
  }

  async function fetchPipeline(options?: { force?: boolean }) {
    const key = 'crm-pipeline'
    const cached = cache.value[key]
    if (cached && !options?.force && isFresh(cached)) {
      detail.value = cached.data as CrmPipelineApiResponse
      lastFetchedAt.value = cached.fetchedAt
      return
    }

    pending.value = true
    error.value = null
    try {
      const response = await $fetch<CrmPipelineApiResponse>('/api/crm/pipeline')
      detail.value = response
      lastFetchedAt.value = Date.now()
      cache.value[key] = { fetchedAt: lastFetchedAt.value, data: response }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Unable to fetch CRM pipeline'
      throw err
    } finally {
      pending.value = false
    }
  }

  async function transitionDeal(
    dealId: string,
    payload: WorldCrmTransitionPayload,
  ) {
    pending.value = true
    error.value = null
    try {
      const response = await $fetch<CrmPipelineApiResponse>(
        `/api/crm/deals/${dealId}/transition`,
        {
          method: 'PATCH',
          body: payload,
        },
      )
      detail.value = response
      lastFetchedAt.value = Date.now()
      cache.value['crm-pipeline'] = {
        fetchedAt: lastFetchedAt.value,
        data: response,
      }
      invalidateCache('crm-projects')
      invalidateCache('crm-companies')
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Unable to transition deal'
      throw err
    } finally {
      pending.value = false
    }
  }

  async function fetchAdmin(options?: { force?: boolean }) {
    const key = 'crm-admin'
    const cached = cache.value[key]
    if (cached && !options?.force && isFresh(cached)) {
      detail.value = cached.data as CrmAdminApiResponse
      lastFetchedAt.value = cached.fetchedAt
      return
    }

    pending.value = true
    error.value = null
    try {
      const response = await $fetch<CrmAdminApiResponse>('/api/world/crm/admin')
      detail.value = response
      lastFetchedAt.value = Date.now()
      cache.value[key] = { fetchedAt: lastFetchedAt.value, data: response }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Unable to fetch CRM admin data'
      throw err
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
    fetchList,
    fetchPipeline,
    transitionDeal,
    fetchAdmin,
    invalidateCache,
  }
})
