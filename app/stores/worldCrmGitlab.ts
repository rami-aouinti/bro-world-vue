import type {
  CrmGithubAttachRepositoryPayload,
  CrmGithubBootstrapPayload,
  CrmGithubBootstrapResponse,
  CrmGithubCreateBranchPayload,
  CrmGithubCreateIssuePayload,
  CrmGithubCreateProjectBoardPayload,
  CrmGithubCreateRepositoryPayload,
  CrmGithubCommitDetail,
  CrmGithubCommitSummary,
  CrmGithubCollaborator,
  CrmGithubDeleteBranchPayload,
  CrmGithubIssueCommentPayload,
  CrmGithubIssueStatePayload,
  CrmGithubListResponse,
  CrmGithubMoveProjectItemPayload,
  CrmGithubPullRequestActionPayload,
  CrmGithubPullRequestCreatePayload,
  CrmGithubPullRequestPatchPayload,
  CrmGithubIssuePatchPayload,
  CrmGithubRepositoryPatchPayload,
  CrmGithubSyncJobStatus,
  CrmGithubSyncContext,
  CrmGithubTaskRequestBranchPayload,
  CrmGithubUpdateRepositoryBindingPayload,
  CrmGithubWorkflow,
  CrmGithubWorkflowRun,
} from '~/types/world/crmGithub'

const CRM_GITLAB_TTL_MS = 3 * 60 * 1000

function buildCacheKey(endpoint: string, query?: Record<string, unknown>) {
  const normalizedEndpoint = endpoint.trim().replace(/^\/+|\/+$/g, '')
  const normalizedQuery = Object.entries(query ?? {})
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    )
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&')

  const applicationMatch = normalizedEndpoint.match(
    /^api\/world\/crm\/applications\/([^/]+)\/projects\/([^/]+)\/gitlab\/(.+)$/,
  )
  const projectMatch = normalizedEndpoint.match(
    /^api\/world\/crm\/general\/projects\/([^/]+)\/gitlab\/(.+)$/,
  )

  const keyBase = (() => {
    if (applicationMatch) {
      const [, applicationSlug, projectId, resource] = applicationMatch
      return `gitlab:app=${decodeURIComponent(applicationSlug)}:project=${decodeURIComponent(projectId)}:resource=${resource}`
    }
    if (projectMatch) {
      const [, projectId, resource] = projectMatch
      return `gitlab:project=${decodeURIComponent(projectId)}:resource=${resource}`
    }
    return `gitlab:endpoint=${normalizedEndpoint}`
  })()

  return normalizedQuery ? `${keyBase}:${normalizedQuery}` : keyBase
}

export const useWorldCrmGitlabStore = defineStore('world-crm-gitlab', () => {
  const pending = ref(false)
  const error = ref<string | null>(null)
  const lastFetchedAt = ref<number | null>(null)
  const cache = ref<Record<string, { fetchedAt: number; data: unknown }>>({})
  const syncContext = ref<CrmGithubSyncContext | null>(null)
  const repositoryPreloadState = ref<Record<string, boolean>>({})

  function withSyncContextQuery(
    endpoint: string,
    query?: Record<string, unknown>,
  ): Record<string, unknown> | undefined {
    const context = syncContext.value
    const isSyncContextEndpoint = endpoint.startsWith(
      '/api/world/crm/general/gitlab/sync/context',
    )

    if (!isSyncContextEndpoint || !context) {
      return query
    }

    const mergedQuery: Record<string, unknown> = { ...(query ?? {}) }

    if (!mergedQuery.jobId && context.jobId) {
      mergedQuery.jobId = context.jobId
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
    return !!entry && Date.now() - entry.fetchedAt < CRM_GITLAB_TTL_MS
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

  function forceRefresh(prefix?: string) {
    invalidateCache(prefix)
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
        err instanceof Error ? err.message : 'Unable to fetch CRM GitLab data'
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
        err instanceof Error ? err.message : 'Unable to mutate CRM GitLab data'
      throw err
    } finally {
      pending.value = false
    }
  }

  function buildRepositoryScopedQuery(
    repositoryName: string,
    query?: Record<string, unknown>,
  ) {
    return {
      ...(query ?? {}),
      repository: repositoryName,
      repo: repositoryName,
    }
  }

  function buildRepositoryPreloadKey(
    projectId: string,
    repositoryName: string,
    applicationSlug?: string,
  ) {
    return [
      `project=${projectId}`,
      `repository=${repositoryName}`,
      `applicationSlug=${applicationSlug ?? '-'}`,
    ].join(':')
  }

  const projectBase = (projectId: string) =>
    `/api/world/crm/general/projects/${projectId}/gitlab`
  const scopedProjectBase = (projectId: string, applicationSlug?: string) =>
    applicationSlug
      ? `/api/world/crm/applications/${encodeURIComponent(applicationSlug)}/projects/${projectId}/gitlab`
      : projectBase(projectId)

  return {
    pending,
    error,
    lastFetchedAt,
    syncContext,
    invalidateCache,
    forceRefresh,
    loadSyncContext: async (options?: { force?: boolean }) => {
      const context = await get<CrmGithubSyncContext | null>(
        '/api/world/crm/general/gitlab/sync/context',
        undefined,
        options,
      )
      syncContext.value = context
      return context
    },
    getProjectDashboard: (projectId: string, options?: { force?: boolean }) =>
      get(`${projectBase(projectId)}/dashboard`, undefined, options),
    getProjectRepositories: (
      projectId: string,
      query?: Record<string, unknown>,
    ) =>
      get<CrmGithubListResponse>(
        `${projectBase(projectId)}/repositories`,
        query,
      ),
    getProjectRepositoryDetail: (projectId: string, repository: string) =>
      get(
        `${projectBase(projectId)}/repositories/${encodeURIComponent(repository)}`,
      ),
    attachRepository: (
      projectId: string,
      body: CrmGithubAttachRepositoryPayload,
    ) =>
      mutate(`${projectBase(projectId)}/repositories`, 'POST', {
        body,
        invalidatePrefix: `${projectBase(projectId)}/repositories`,
      }),
    createRepository: (
      projectId: string,
      body: CrmGithubCreateRepositoryPayload,
    ) =>
      mutate(`${projectBase(projectId)}/repositories/create`, 'POST', {
        body,
        invalidatePrefix: `${projectBase(projectId)}/repositories`,
      }),
    updateRepositoryBinding: (
      projectId: string,
      repositoryId: string,
      body: CrmGithubUpdateRepositoryBindingPayload,
    ) =>
      mutate(
        `${projectBase(projectId)}/repositories/${encodeURIComponent(repositoryId)}`,
        'PUT',
        {
          body,
          invalidatePrefix: `${projectBase(projectId)}/repositories`,
        },
      ),
    deleteRepositoryBinding: (
      projectId: string,
      repositoryId: string,
      query?: Record<string, unknown>,
    ) =>
      mutate(
        `${projectBase(projectId)}/repositories/${encodeURIComponent(repositoryId)}`,
        'DELETE',
        {
          query,
          invalidatePrefix: `${projectBase(projectId)}/repositories`,
        },
      ),
    getIssues: (projectId: string, query?: Record<string, unknown>) =>
      get<CrmGithubListResponse>(`${projectBase(projectId)}/issues`, query),
    getIssueDetail: (
      projectId: string,
      number: string | number,
      query?: Record<string, unknown>,
    ) => get(`${projectBase(projectId)}/issues/${number}`, query),
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
    ) =>
      mutate(`${projectBase(projectId)}/issues/${number}/comments`, 'POST', {
        body,
      }),
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
      get<CrmGithubListResponse>(
        `${projectBase(projectId)}/pull-requests`,
        query,
      ),
    getScopedPullRequests: (
      projectId: string,
      query?: Record<string, unknown>,
      applicationSlug?: string,
    ) =>
      get<CrmGithubListResponse>(
        `${scopedProjectBase(projectId, applicationSlug)}/pull-requests`,
        query,
      ),
    getCommits: (projectId: string, query?: Record<string, unknown>) =>
      get<CrmGithubListResponse<CrmGithubCommitSummary>>(
        `${projectBase(projectId)}/commits`,
        query,
      ),
    getScopedCommits: (
      projectId: string,
      query?: Record<string, unknown>,
      applicationSlug?: string,
    ) =>
      get<CrmGithubListResponse<CrmGithubCommitSummary>>(
        `${scopedProjectBase(projectId, applicationSlug)}/commits`,
        query,
      ),
    getCommitDetail: (
      projectId: string,
      sha: string,
      query?: Record<string, unknown>,
    ) =>
      get<CrmGithubCommitDetail>(
        `${projectBase(projectId)}/commits/${encodeURIComponent(sha)}`,
        query,
      ),
    getScopedCommitDetail: (
      projectId: string,
      sha: string,
      query?: Record<string, unknown>,
      applicationSlug?: string,
    ) =>
      get<CrmGithubCommitDetail>(
        `${scopedProjectBase(projectId, applicationSlug)}/commits/${encodeURIComponent(sha)}`,
        query,
      ),
    getCollaborators: (projectId: string, query?: Record<string, unknown>) =>
      get<CrmGithubListResponse<CrmGithubCollaborator>>(
        `${projectBase(projectId)}/collaborators`,
        query,
      ),
    getApplicationCollaborators: (
      applicationSlug: string,
      projectId: string,
      query?: Record<string, unknown>,
    ) =>
      get<CrmGithubListResponse<CrmGithubCollaborator>>(
        `/api/world/crm/applications/${encodeURIComponent(applicationSlug)}/projects/${projectId}/gitlab/collaborators`,
        query,
      ),
    getActionsWorkflows: (projectId: string, query?: Record<string, unknown>) =>
      get<CrmGithubListResponse<CrmGithubWorkflow>>(
        `${projectBase(projectId)}/actions/workflows`,
        query,
      ),
    getActionsRuns: (projectId: string, query?: Record<string, unknown>) =>
      get<CrmGithubListResponse<CrmGithubWorkflowRun>>(
        `${projectBase(projectId)}/actions/runs`,
        query,
      ),
    getScopedActionsWorkflows: (
      projectId: string,
      query?: Record<string, unknown>,
      applicationSlug?: string,
    ) =>
      get<CrmGithubListResponse<CrmGithubWorkflow>>(
        `${scopedProjectBase(projectId, applicationSlug)}/actions/workflows`,
        query,
      ),
    getScopedActionsRuns: (
      projectId: string,
      query?: Record<string, unknown>,
      applicationSlug?: string,
    ) =>
      get<CrmGithubListResponse<CrmGithubWorkflowRun>>(
        `${scopedProjectBase(projectId, applicationSlug)}/actions/runs`,
        query,
      ),
    createPullRequest: (
      projectId: string,
      body: CrmGithubPullRequestCreatePayload,
      applicationSlug?: string,
    ) =>
      mutate(
        `${scopedProjectBase(projectId, applicationSlug)}/pull-requests`,
        'POST',
        {
          body,
          invalidatePrefix: `${scopedProjectBase(projectId, applicationSlug)}/pull-requests`,
        },
      ),
    patchPullRequest: (
      projectId: string,
      number: string | number,
      body: CrmGithubPullRequestPatchPayload,
      applicationSlug?: string,
    ) =>
      mutate(
        `${scopedProjectBase(projectId, applicationSlug)}/pull-requests/${number}`,
        'PATCH',
        {
          body,
          invalidatePrefix: `${scopedProjectBase(projectId, applicationSlug)}/pull-requests`,
        },
      ),
    getPullRequestCommits: (
      projectId: string,
      number: string | number,
      query?: Record<string, unknown>,
      applicationSlug?: string,
    ) =>
      get<CrmGithubListResponse<CrmGithubCommitSummary>>(
        `${scopedProjectBase(projectId, applicationSlug)}/pull-requests/${number}/commits`,
        query,
      ),
    patchIssueRich: (
      projectId: string,
      number: string | number,
      body: CrmGithubIssuePatchPayload,
      applicationSlug?: string,
    ) =>
      mutate(
        `${scopedProjectBase(projectId, applicationSlug)}/issues/${number}/patch`,
        'PATCH',
        {
          body,
          invalidatePrefix: `${scopedProjectBase(projectId, applicationSlug)}/issues`,
        },
      ),
    patchRepository: (
      projectId: string,
      body: CrmGithubRepositoryPatchPayload,
      applicationSlug?: string,
    ) =>
      mutate(
        `${scopedProjectBase(projectId, applicationSlug)}/repositories/patch`,
        'PATCH',
        {
          body,
          invalidatePrefix: `${scopedProjectBase(projectId, applicationSlug)}/repositories`,
        },
      ),
    getPullRequestDetail: (
      projectId: string,
      number: string | number,
      query?: Record<string, unknown>,
    ) => get(`${projectBase(projectId)}/pull-requests/${number}`, query),
    getScopedPullRequestDetail: (
      projectId: string,
      number: string | number,
      query?: Record<string, unknown>,
      applicationSlug?: string,
    ) =>
      get(
        `${scopedProjectBase(projectId, applicationSlug)}/pull-requests/${number}`,
        query,
      ),
    pullRequestAction: (
      projectId: string,
      number: string | number,
      body: CrmGithubPullRequestActionPayload,
    ) =>
      mutate(
        `${projectBase(projectId)}/pull-requests/${number}/action`,
        'POST',
        { body },
      ),
    getProjectsBoards: (projectId: string, query?: Record<string, unknown>) =>
      get<CrmGithubListResponse>(`${projectBase(projectId)}/projects`, query),
    createProjectBoard: (
      projectId: string,
      body: CrmGithubCreateProjectBoardPayload,
    ) =>
      mutate(`${projectBase(projectId)}/projects`, 'POST', {
        body,
        invalidatePrefix: `${projectBase(projectId)}/projects`,
      }),
    getProjectBoardItems: (
      projectId: string,
      githubProjectId: string,
      query?: Record<string, unknown>,
    ) =>
      get(`${projectBase(projectId)}/projects/${githubProjectId}/items`, query),
    moveProjectBoardItem: (
      projectId: string,
      githubProjectId: string,
      itemId: string,
      body: CrmGithubMoveProjectItemPayload,
    ) =>
      mutate(
        `${projectBase(projectId)}/projects/${githubProjectId}/items/${itemId}/move`,
        'POST',
        { body },
      ),
    getAccountRepositories: (
      projectId: string,
      query?: Record<string, unknown>,
    ) =>
      get<CrmGithubListResponse>(
        `${projectBase(projectId)}/account/repositories`,
        query,
      ),
    bootstrapSync: (body: CrmGithubBootstrapPayload) =>
      mutate<CrmGithubBootstrapResponse>(
        '/api/world/crm/general/gitlab/sync/bootstrap',
        'POST',
        {
          body,
          invalidatePrefix: '/api/world/crm/general/gitlab/sync/jobs',
        },
      ).then((response) => {
        rememberSyncContext({
          jobId: response.jobId,
          status: response.status,
        })
        return response
      }),
    getSyncJobStatus: (jobId: string, options?: { force?: boolean }) =>
      get<CrmGithubSyncJobStatus>(
        `/api/world/crm/general/gitlab/sync/jobs/${jobId}`,
        undefined,
        options,
      ).then((response) => {
        rememberSyncContext({
          jobId: response.id,
          applicationSlug: response.applicationSlug,
          owner: response.owner,
          status: response.status,
        })
        return response
      }),
    getTaskRequestBranches: (
      taskRequestId: string,
      options?: { force?: boolean },
    ) =>
      get<CrmGithubListResponse>(
        `/api/world/crm/general/task-requests/${taskRequestId}/gitlab/branches`,
        undefined,
        options,
      ),
    createTaskRequestBranch: (
      taskRequestId: string,
      body: CrmGithubTaskRequestBranchPayload,
    ) =>
      mutate(
        `/api/world/crm/general/task-requests/${taskRequestId}/gitlab/branches`,
        'POST',
        {
          body,
          invalidatePrefix: `/api/world/crm/general/task-requests/${taskRequestId}/gitlab/branches`,
        },
      ),
    deleteTaskRequestBranch: (
      taskRequestId: string,
      branchId: string,
      query?: Record<string, unknown>,
    ) =>
      mutate(
        `/api/world/crm/general/task-requests/${taskRequestId}/gitlab/branches/${branchId}`,
        'DELETE',
        {
          query,
          invalidatePrefix: `/api/world/crm/general/task-requests/${taskRequestId}/gitlab/branches`,
        },
      ),
    preloadRepositoryCriticalDatasets: async (
      projectId: string,
      repositoryName: string,
      applicationSlug?: string,
      options?: { force?: boolean },
    ) => {
      const preloadKey = buildRepositoryPreloadKey(
        projectId,
        repositoryName,
        applicationSlug,
      )
      if (repositoryPreloadState.value[preloadKey] && !options?.force) {
        return
      }

      const query = buildRepositoryScopedQuery(repositoryName)
      const basePath = projectBase(projectId)
      const scopedBasePath = scopedProjectBase(projectId, applicationSlug)
      await Promise.all([
        get<CrmGithubListResponse<CrmGithubCollaborator>>(
          `${basePath}/collaborators`,
          query,
        ),
        get<CrmGithubListResponse>(`${basePath}/branches`, query),
        get<CrmGithubListResponse<CrmGithubCommitSummary>>(
          `${scopedBasePath}/commits`,
          query,
        ),
        get<CrmGithubListResponse>(`${scopedBasePath}/pull-requests`, query),
        get<CrmGithubListResponse<CrmGithubWorkflow>>(
          `${scopedBasePath}/actions/workflows`,
          query,
        ),
      ])

      repositoryPreloadState.value[preloadKey] = true
    },
  }
})
