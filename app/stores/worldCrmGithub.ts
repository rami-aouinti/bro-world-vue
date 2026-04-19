import type {
  CrmGithubAttachRepositoryPayload,
  CrmGithubBootstrapPayload,
  CrmGithubBootstrapResponse,
  CrmGithubCreateBranchPayload,
  CrmGithubCreateIssuePayload,
  CrmGithubCreateProjectBoardPayload,
  CrmGithubCreateRepositoryPayload,
  CrmGithubDeleteBranchPayload,
  CrmGithubIssueCommentPayload,
  CrmGithubIssueStatePayload,
  CrmGithubListResponse,
  CrmGithubMoveProjectItemPayload,
  CrmGithubPullRequestActionPayload,
  CrmGithubSyncJobStatus,
  CrmGithubSyncContext,
  CrmGithubTaskRequestBranchPayload,
  CrmGithubUpdateRepositoryBindingPayload,
} from '~/types/world/crmGithub'

const CRM_GITHUB_TTL_MS = 3 * 60 * 1000

function buildCacheKey(endpoint: string, query?: Record<string, unknown>) {
  const normalizedQuery = Object.entries(query ?? {})
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&')

  return normalizedQuery ? `${endpoint}?${normalizedQuery}` : endpoint
}

export const useWorldCrmGithubStore = defineStore('world-crm-github', () => {
  const pending = ref(false)
  const error = ref<string | null>(null)
  const lastFetchedAt = ref<number | null>(null)
  const cache = ref<Record<string, { fetchedAt: number; data: unknown }>>({})
  const syncContext = ref<CrmGithubSyncContext | null>(null)

  function withSyncContextQuery(
    endpoint: string,
    query?: Record<string, unknown>,
  ): Record<string, unknown> | undefined {
    const context = syncContext.value
    const isGithubWorldEndpoint = endpoint.startsWith('/api/world/crm/general/')
      && endpoint.includes('/github/')

    if (!isGithubWorldEndpoint || !context) {
      return query
    }

    const mergedQuery: Record<string, unknown> = { ...(query ?? {}) }

    if (!mergedQuery.jobId && context.jobId) {
      mergedQuery.jobId = context.jobId
    }

    if (!mergedQuery.applicationSlug && context.applicationSlug) {
      mergedQuery.applicationSlug = context.applicationSlug
    }

    return mergedQuery
  }

  function rememberSyncContext(context: Partial<CrmGithubSyncContext>) {
    syncContext.value = {
      ...(syncContext.value ?? { updatedAt: new Date().toISOString() }),
      ...context,
      updatedAt: new Date().toISOString(),
    }
  }

  function isFresh(entry?: { fetchedAt: number }) {
    return !!entry && Date.now() - entry.fetchedAt < CRM_GITHUB_TTL_MS
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

  async function get<TResponse = Record<string, unknown>>(
    endpoint: string,
    query?: Record<string, unknown>,
    options?: { force?: boolean },
  ) {
    const finalQuery = withSyncContextQuery(endpoint, query)
    const cacheKey = buildCacheKey(endpoint, finalQuery)
    const cached = cache.value[cacheKey]

    if (cached && !options?.force && isFresh(cached)) {
      lastFetchedAt.value = cached.fetchedAt
      return cached.data as TResponse
    }

    pending.value = true
    error.value = null

    try {
      const response = await $fetch<TResponse>(endpoint, { query: finalQuery })
      lastFetchedAt.value = Date.now()
      cache.value[cacheKey] = { fetchedAt: lastFetchedAt.value, data: response }
      return response
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Unable to fetch CRM GitHub data'
      throw err
    } finally {
      pending.value = false
    }
  }

  async function mutate<TResponse = Record<string, unknown>>(
    endpoint: string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    options?: {
      body?: Record<string, unknown>
      query?: Record<string, unknown>
      invalidatePrefix?: string
    },
  ) {
    pending.value = true
    error.value = null

    const finalQuery = withSyncContextQuery(endpoint, options?.query)

    try {
      const response = await $fetch<TResponse>(endpoint, {
        method,
        body: options?.body,
        query: finalQuery,
      })

      invalidateCache(options?.invalidatePrefix)
      return response
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Unable to mutate CRM GitHub data'
      throw err
    } finally {
      pending.value = false
    }
  }

  const projectBase = (projectId: string) =>
    `/api/world/crm/general/projects/${projectId}/github`

  return {
    pending,
    error,
    lastFetchedAt,
    syncContext,
    invalidateCache,
    loadSyncContext: async (options?: { force?: boolean }) => {
      const context = await get<CrmGithubSyncContext | null>(
        '/api/world/crm/general/github/sync/context',
        undefined,
        options,
      )
      syncContext.value = context
      return context
    },
    getProjectDashboard: (projectId: string, options?: { force?: boolean }) =>
      get(`${projectBase(projectId)}/dashboard`, undefined, options),
    getProjectRepositories: (projectId: string, query?: Record<string, unknown>) =>
      get<CrmGithubListResponse>(`${projectBase(projectId)}/repositories`, query),
    getProjectRepositoryDetail: (projectId: string, repository: string) =>
      get(`${projectBase(projectId)}/repositories/${encodeURIComponent(repository)}`),
    attachRepository: (projectId: string, body: CrmGithubAttachRepositoryPayload) =>
      mutate(`${projectBase(projectId)}/repositories`, 'POST', {
        body,
        invalidatePrefix: `${projectBase(projectId)}/repositories`,
      }),
    createRepository: (projectId: string, body: CrmGithubCreateRepositoryPayload) =>
      mutate(`${projectBase(projectId)}/repositories/create`, 'POST', {
        body,
        invalidatePrefix: `${projectBase(projectId)}/repositories`,
      }),
    updateRepositoryBinding: (
      projectId: string,
      repositoryId: string,
      body: CrmGithubUpdateRepositoryBindingPayload,
    ) =>
      mutate(`${projectBase(projectId)}/repositories/${encodeURIComponent(repositoryId)}`, 'PUT', {
        body,
        invalidatePrefix: `${projectBase(projectId)}/repositories`,
      }),
    deleteRepositoryBinding: (
      projectId: string,
      repositoryId: string,
      query?: Record<string, unknown>,
    ) =>
      mutate(`${projectBase(projectId)}/repositories/${encodeURIComponent(repositoryId)}`, 'DELETE', {
        query,
        invalidatePrefix: `${projectBase(projectId)}/repositories`,
      }),
    getIssues: (projectId: string, query?: Record<string, unknown>) =>
      get<CrmGithubListResponse>(`${projectBase(projectId)}/issues`, query),
    getIssueDetail: (projectId: string, number: string | number, query?: Record<string, unknown>) =>
      get(`${projectBase(projectId)}/issues/${number}`, query),
    createIssue: (projectId: string, body: CrmGithubCreateIssuePayload) =>
      mutate(`${projectBase(projectId)}/issues`, 'POST', {
        body,
        invalidatePrefix: `${projectBase(projectId)}/issues`,
      }),
    patchIssueState: (
      projectId: string,
      number: string | number,
      body: CrmGithubIssueStatePayload,
    ) =>
      mutate(`${projectBase(projectId)}/issues/${number}`, 'PATCH', {
        body,
        invalidatePrefix: `${projectBase(projectId)}/issues`,
      }),
    createIssueComment: (
      projectId: string,
      number: string | number,
      body: CrmGithubIssueCommentPayload,
    ) => mutate(`${projectBase(projectId)}/issues/${number}/comments`, 'POST', { body }),
    getBranches: (projectId: string, query?: Record<string, unknown>) =>
      get<CrmGithubListResponse>(`${projectBase(projectId)}/branches`, query),
    createBranch: (projectId: string, body: CrmGithubCreateBranchPayload) =>
      mutate(`${projectBase(projectId)}/branches/create`, 'POST', {
        body,
        invalidatePrefix: `${projectBase(projectId)}/branches`,
      }),
    deleteBranch: (projectId: string, body: CrmGithubDeleteBranchPayload) =>
      mutate(`${projectBase(projectId)}/branches/delete`, 'DELETE', {
        body,
        invalidatePrefix: `${projectBase(projectId)}/branches`,
      }),
    getPullRequests: (projectId: string, query?: Record<string, unknown>) =>
      get<CrmGithubListResponse>(`${projectBase(projectId)}/pull-requests`, query),
    getPullRequestDetail: (
      projectId: string,
      number: string | number,
      query?: Record<string, unknown>,
    ) => get(`${projectBase(projectId)}/pull-requests/${number}`, query),
    pullRequestAction: (
      projectId: string,
      number: string | number,
      body: CrmGithubPullRequestActionPayload,
    ) => mutate(`${projectBase(projectId)}/pull-requests/${number}/action`, 'POST', { body }),
    getProjectsBoards: (projectId: string, query?: Record<string, unknown>) =>
      get<CrmGithubListResponse>(`${projectBase(projectId)}/projects`, query),
    createProjectBoard: (projectId: string, body: CrmGithubCreateProjectBoardPayload) =>
      mutate(`${projectBase(projectId)}/projects`, 'POST', {
        body,
        invalidatePrefix: `${projectBase(projectId)}/projects`,
      }),
    getProjectBoardItems: (
      projectId: string,
      githubProjectId: string,
      query?: Record<string, unknown>,
    ) => get(`${projectBase(projectId)}/projects/${githubProjectId}/items`, query),
    moveProjectBoardItem: (
      projectId: string,
      githubProjectId: string,
      itemId: string,
      body: CrmGithubMoveProjectItemPayload,
    ) => mutate(`${projectBase(projectId)}/projects/${githubProjectId}/items/${itemId}/move`, 'POST', { body }),
    getAccountRepositories: (projectId: string, query?: Record<string, unknown>) =>
      get<CrmGithubListResponse>(`${projectBase(projectId)}/account/repositories`, query),
    bootstrapSync: (body: CrmGithubBootstrapPayload) =>
      mutate<CrmGithubBootstrapResponse>('/api/world/crm/general/github/sync/bootstrap', 'POST', {
        body,
        invalidatePrefix: '/api/world/crm/general/github/sync/jobs',
      }).then((response) => {
        rememberSyncContext({
          jobId: response.jobId,
          status: response.status,
        })
        return response
      }),
    getSyncJobStatus: (jobId: string, options?: { force?: boolean }) =>
      get<CrmGithubSyncJobStatus>(`/api/world/crm/general/github/sync/jobs/${jobId}`, undefined, options).then((response) => {
        rememberSyncContext({
          jobId: response.id,
          applicationSlug: response.applicationSlug,
          owner: response.owner,
          status: response.status,
        })
        return response
      }),
    getTaskRequestBranches: (taskRequestId: string, options?: { force?: boolean }) =>
      get<CrmGithubListResponse>(`/api/world/crm/general/task-requests/${taskRequestId}/github/branches`, undefined, options),
    createTaskRequestBranch: (
      taskRequestId: string,
      body: CrmGithubTaskRequestBranchPayload,
    ) =>
      mutate(`/api/world/crm/general/task-requests/${taskRequestId}/github/branches`, 'POST', {
        body,
        invalidatePrefix: `/api/world/crm/general/task-requests/${taskRequestId}/github/branches`,
      }),
    deleteTaskRequestBranch: (
      taskRequestId: string,
      branchId: string,
      query?: Record<string, unknown>,
    ) =>
      mutate(
        `/api/world/crm/general/task-requests/${taskRequestId}/github/branches/${branchId}`,
        'DELETE',
        {
          query,
          invalidatePrefix: `/api/world/crm/general/task-requests/${taskRequestId}/github/branches`,
        },
      ),
  }
})
