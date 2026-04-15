import type {
  JobCandidate,
  JobPermissionMatrix,
  JobsAdminDashboardResponse,
  JobsAdminPolicyResponse,
} from '~~/server/types/api/jobs'
import type {
  WorldJobsFilters,
  WorldJobsTransitionPayload,
  WorldPaginationState,
} from '~/types/world/jobs'
import {
  recordStoreCacheEvent,
  runTrackedStoreFetch,
} from '~/utils/storeTelemetry'

const JOBS_TTL_MS = 2 * 60 * 1000

function buildCacheKey(prefix: string, filters: Record<string, unknown>) {
  const serialized = Object.entries(filters)
    .filter(
      ([, value]) =>
        value !== undefined && value !== null && String(value).trim() !== '',
    )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join(':')

  return `${prefix}${serialized ? `:${serialized}` : ''}`
}

export const useWorldJobsStore = defineStore('world-jobs', () => {
  const items = ref<JobCandidate[]>([])
  const detail = ref<
    JobsAdminPolicyResponse | JobsAdminDashboardResponse | null
  >(null)
  const pending = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<WorldJobsFilters>({ context: 'offers' })
  const pagination = ref<WorldPaginationState>({
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 1,
  })
  const lastFetchedAt = ref<number | null>(null)

  const stages = ref<readonly string[]>([])
  const policy = ref<JobsAdminPolicyResponse | null>(null)
  const dashboard = ref<JobsAdminDashboardResponse | null>(null)
  const cache = ref<Record<string, { fetchedAt: number; data: unknown }>>({})

  function isFresh(entry?: { fetchedAt: number }) {
    return !!entry && Date.now() - entry.fetchedAt < JOBS_TTL_MS
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

  async function fetchCandidates(
    context: 'offers' | 'applications' | 'my-offers',
    options?: { force?: boolean },
  ) {
    filters.value.context = context
    const cacheKey = buildCacheKey('jobs-candidates', { context })
    const cached = cache.value[cacheKey]

    if (cached && !options?.force && isFresh(cached)) {
      recordStoreCacheEvent('jobs', true)
      const response = cached.data as {
        items: JobCandidate[]
        stages: readonly string[]
      }
      items.value = response.items
      stages.value = response.stages
      pagination.value.total = response.items.length
      lastFetchedAt.value = cached.fetchedAt
      return
    }
    recordStoreCacheEvent('jobs', false)

    pending.value = true
    error.value = null
    try {
      const response = await runTrackedStoreFetch('jobs', () =>
        $fetch<{
          items: JobCandidate[]
          stages: readonly string[]
        }>('/api/jobs/candidates', {
          query: { context },
        }),
      )
      items.value = response.items
      stages.value = response.stages
      pagination.value.total = response.items.length
      lastFetchedAt.value = Date.now()
      cache.value[cacheKey] = { fetchedAt: lastFetchedAt.value, data: response }
    } finally {
      pending.value = false
    }
  }

  async function transitionCandidate(
    candidateId: string,
    payload: WorldJobsTransitionPayload,
  ) {
    pending.value = true
    error.value = null
    try {
      await runTrackedStoreFetch('jobs', () =>
        $fetch(`/api/jobs/candidates/${candidateId}/transition`, {
          method: 'PATCH',
          body: payload,
        }),
      )
      invalidateCache('jobs-candidates')
    } finally {
      pending.value = false
    }
  }

  async function fetchAdminPolicy(options?: { force?: boolean }) {
    const cacheKey = 'jobs-admin-policy'
    const cached = cache.value[cacheKey]
    if (cached && !options?.force && isFresh(cached)) {
      recordStoreCacheEvent('jobs', true)
      policy.value = cached.data as JobsAdminPolicyResponse
      detail.value = policy.value
      return
    }
    recordStoreCacheEvent('jobs', false)

    pending.value = true
    error.value = null
    try {
      const response = await runTrackedStoreFetch('jobs', () =>
        $fetch<JobsAdminPolicyResponse>('/api/jobs/admin/policy'),
      )
      policy.value = response
      detail.value = response
      lastFetchedAt.value = Date.now()
      cache.value[cacheKey] = { fetchedAt: lastFetchedAt.value, data: response }
    } finally {
      pending.value = false
    }
  }

  async function fetchAdminDashboard(options?: { force?: boolean }) {
    const cacheKey = 'jobs-admin-dashboard'
    const cached = cache.value[cacheKey]
    if (cached && !options?.force && isFresh(cached)) {
      recordStoreCacheEvent('jobs', true)
      dashboard.value = cached.data as JobsAdminDashboardResponse
      return
    }
    recordStoreCacheEvent('jobs', false)

    pending.value = true
    error.value = null
    try {
      const response = await runTrackedStoreFetch('jobs', () =>
        $fetch<JobsAdminDashboardResponse>('/api/jobs/admin/dashboard'),
      )
      dashboard.value = response
      lastFetchedAt.value = Date.now()
      cache.value[cacheKey] = { fetchedAt: lastFetchedAt.value, data: response }
    } finally {
      pending.value = false
    }
  }

  async function updateAdminPolicy(payload: Record<string, unknown>) {
    pending.value = true
    error.value = null
    try {
      await runTrackedStoreFetch('jobs', () =>
        $fetch('/api/jobs/admin/policy', { method: 'PATCH', body: payload }),
      )
      invalidateCache('jobs-admin-policy')
      await fetchAdminPolicy({ force: true })
    } finally {
      pending.value = false
    }
  }

  async function updateRolePermission(
    role: string,
    key: keyof JobPermissionMatrix,
    value: boolean,
  ) {
    pending.value = true
    error.value = null
    try {
      await runTrackedStoreFetch('jobs', () =>
        $fetch(`/api/jobs/admin/permissions/${role}`, {
          method: 'PATCH',
          body: { [key]: value },
        }),
      )
      invalidateCache('jobs-admin-policy')
      await fetchAdminPolicy({ force: true })
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
    stages,
    policy,
    dashboard,
    fetchCandidates,
    transitionCandidate,
    fetchAdminPolicy,
    fetchAdminDashboard,
    updateAdminPolicy,
    updateRolePermission,
    invalidateCache,
  }
})
