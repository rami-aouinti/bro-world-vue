import type { H3Event } from 'h3'
import {
  getCached,
  invalidateByPrefix,
  privateCacheKey,
  setCached,
} from './apiCache'
import { resolveCacheTtl } from './apiCacheConfig'
import { getServerPrivateAxios, resolveServerApiUrl } from './http/axiosClient'
import { invalidateMutationCaches } from './mutationInvalidation'
import { getSessionAuth } from './privateApi'

const CRM_BASE_ENDPOINT = '/crm'
const CRM_PUBLIC_BASE_URL = 'https://bro-world.org/api/v1/crm'
const CRM_GITLAB_MUTATION_KEY = 'crm:general:mutate'
const MONTH_IN_SECONDS = 30 * 24 * 60 * 60
const CRM_GITLAB_SYNC_CONTEXT_ENDPOINT = 'crm/gitlab/sync/context'
const CRM_GITLAB_SYNC_CONTEXT_LEGACY_ENDPOINT =
  'crm/general/gitlab/sync/context'
const CRM_CACHE_PREFIX = 'crm'

const CRM_GITLAB_TTL_BY_PATH: Array<{ pattern: RegExp; ttl: number }> = [
  {
    pattern:
      /^projects\/[^/]+\/gitlab\/(commits|branches|pull-requests|collaborators)(\/|$)/,
    ttl: 60,
  },
  { pattern: /^projects\/[^/]+\/gitlab\/actions\/workflows(\/|$)/, ttl: 180 },
  { pattern: /^projects\/[^/]+\/gitlab\/actions\/runs(\/|$)/, ttl: 45 },
]

export type CrmGitlabSyncContext = {
  jobId?: string
  applicationSlug?: string
  owner?: string
  status?: string
  updatedAt: string
}

function isBootstrapPath(path: string) {
  return path.replace(/^\/+/, '') === 'gitlab/sync/bootstrap'
}

function extractSyncJobIdPath(path: string) {
  const normalizedPath = path.replace(/^\/+/, '')
  const match = normalizedPath.match(/^gitlab\/sync\/jobs\/([^/]+)$/)
  return match?.[1] ?? null
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null
}

function toNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined
}

async function getSyncContextCacheKey(event: H3Event) {
  const { username } = await getSessionAuth(event)
  return privateCacheKey(username, CRM_GITLAB_SYNC_CONTEXT_ENDPOINT)
}

export async function getCrmGitlabSyncContext(event: H3Event) {
  const cacheKey = await getSyncContextCacheKey(event)
  const cached = await getCached<CrmGitlabSyncContext>(cacheKey)
  if (cached) {
    return cached
  }

  const { username } = await getSessionAuth(event)
  const legacyCacheKey = privateCacheKey(
    username,
    CRM_GITLAB_SYNC_CONTEXT_LEGACY_ENDPOINT,
  )
  const legacyCached = await getCached<CrmGitlabSyncContext>(legacyCacheKey)

  if (!legacyCached) {
    return null
  }

  await setCached(cacheKey, legacyCached, MONTH_IN_SECONDS)
  return legacyCached
}

async function saveCrmGitlabSyncContext(
  event: H3Event,
  context: Partial<CrmGitlabSyncContext>,
) {
  const cacheKey = await getSyncContextCacheKey(event)
  const previous = (await getCached<CrmGitlabSyncContext>(cacheKey)) ?? {
    updatedAt: new Date().toISOString(),
  }

  const nextContext: CrmGitlabSyncContext = {
    ...previous,
    ...context,
    updatedAt: new Date().toISOString(),
  }

  await setCached(cacheKey, nextContext, MONTH_IN_SECONDS)

  return nextContext
}

async function saveCrmGitlabSyncContextIfAuthenticated(
  event: H3Event,
  context: Partial<CrmGitlabSyncContext>,
) {
  try {
    await saveCrmGitlabSyncContext(event, context)
  } catch {
    // Ignore when request is unauthenticated; GET endpoints can be public.
  }
}

function crmGitlabEndpoint(path: string) {
  const normalizedPath = path.replace(/^\/+/, '')
  return `${CRM_BASE_ENDPOINT}/${normalizedPath}`
}

function resolveCrmGitlabGetTtl(path: string) {
  const normalizedPath = path.replace(/^\/+/, '')
  const override = CRM_GITLAB_TTL_BY_PATH.find(({ pattern }) =>
    pattern.test(normalizedPath),
  )
  return override?.ttl ?? resolveCacheTtl('crm')
}

function buildCrmPrivateEndpointPrefix(
  username: string,
  endpoint: string,
  options?: { includeLegacyGeneralPath?: boolean },
) {
  const normalizedUsername = username.trim()
  const normalizedEndpoint = endpoint.trim().replace(/^\/+|\/+$/g, '')
  const prefixes = [
    `api:private:${normalizedUsername}:${CRM_CACHE_PREFIX}:${normalizedEndpoint}:`,
  ]

  if (options?.includeLegacyGeneralPath) {
    prefixes.push(
      `api:private:${normalizedUsername}:${CRM_CACHE_PREFIX}:crm/general/${normalizedEndpoint}:`,
    )
  }

  return prefixes
}

function buildCrmPublicEndpointPrefix(
  endpoint: string,
  options?: { includeLegacyGeneralPath?: boolean },
) {
  const normalizedEndpoint = endpoint.trim().replace(/^\/+|\/+$/g, '')
  const prefixes = [`api:public:${CRM_CACHE_PREFIX}:${normalizedEndpoint}:`]

  if (options?.includeLegacyGeneralPath) {
    prefixes.push(
      `api:public:${CRM_CACHE_PREFIX}:crm/general/${normalizedEndpoint}:`,
    )
  }

  return prefixes
}

function buildCrmGitlabMutationPrefixes(path: string) {
  const normalizedPath = path.replace(/^\/+/, '')
  const projectMatch = normalizedPath.match(/^projects\/([^/]+)\/gitlab\/(.+)$/)

  if (!projectMatch) {
    return []
  }

  const [, projectId, resourcePath] = projectMatch
  if (!resourcePath) {
    return []
  }

  const firstSegment = resourcePath.split('/')[0]
  if (!firstSegment) {
    return []
  }

  const projectRoot = `crm/projects/${projectId}/gitlab`
  const prefixes = new Set<string>([
    `${projectRoot}/${firstSegment}`,
    `${projectRoot}/dashboard`,
  ])

  if (firstSegment === 'actions') {
    prefixes.add(`${projectRoot}/actions/workflows`)
    prefixes.add(`${projectRoot}/actions/runs`)
  }

  return Array.from(prefixes)
}

async function invalidateCrmGitlabPrefixes(
  event: H3Event,
  endpointPrefixes: string[],
) {
  if (!endpointPrefixes.length) {
    return
  }

  const session = await getSessionAuth(event).catch(() => null)

  await Promise.all(
    endpointPrefixes.flatMap((endpointPrefix) => {
      const prefixes = buildCrmPublicEndpointPrefix(endpointPrefix, {
        includeLegacyGeneralPath: true,
      })

      if (session?.username) {
        prefixes.push(
          ...buildCrmPrivateEndpointPrefix(session.username, endpointPrefix, {
            includeLegacyGeneralPath: true,
          }),
        )
      }

      return prefixes.map((prefix) => invalidateByPrefix(prefix))
    }),
  )
}

export async function cachedCrmGitlabGeneralGet<TResponse = unknown>(
  event: H3Event,
  path: string,
  query?: Record<string, unknown>,
): Promise<TResponse> {
  const normalizedPath = path.replace(/^\/+/, '')
  const endpoint = crmGitlabEndpoint(path)
  const sessionAuth = await getSessionAuth(event).catch(() => null)
  const cacheScope = sessionAuth?.username ?? 'public'
  const cacheKey = privateCacheKey(cacheScope, endpoint, query)

  const cached = await getCached<TResponse>(cacheKey)
  if (cached) {
    return cached
  }

  const response = sessionAuth
    ? await (async () => {
        const client = await getServerPrivateAxios(event)
        const privateResponse = await client.request<TResponse>({
          url: resolveServerApiUrl(event, endpoint),
          method: 'GET',
          params: query,
        })

        return privateResponse.data
      })()
    : await $fetch<TResponse>(`${CRM_PUBLIC_BASE_URL}/${normalizedPath}`, {
        query,
      })

  const syncJobId = extractSyncJobIdPath(path)
  if (syncJobId) {
    const payload = asRecord(response)
    const applicationSlug = toNonEmptyString(payload?.applicationSlug)
    const owner = toNonEmptyString(payload?.owner)
    const status = toNonEmptyString(payload?.status)
    const id = toNonEmptyString(payload?.id)

    if (id || applicationSlug || owner || status) {
      await saveCrmGitlabSyncContextIfAuthenticated(event, {
        jobId: id ?? syncJobId,
        applicationSlug,
        owner,
        status,
      })
    }
  }

  await setCached(cacheKey, response, resolveCrmGitlabGetTtl(path))

  return response
}

export async function mutateCrmGitlabGeneral<TResponse = unknown>(
  event: H3Event,
  path: string,
  options: {
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: unknown
    query?: Record<string, unknown>
  },
): Promise<TResponse> {
  const endpoint = crmGitlabEndpoint(path)
  const client = await getServerPrivateAxios(event)

  const response = await client.request<TResponse>({
    url: resolveServerApiUrl(event, endpoint),
    method: options.method,
    params: options.query,
    data: options.body,
  })

  if (isBootstrapPath(path)) {
    const payload = asRecord(response.data)
    const jobId = toNonEmptyString(payload?.jobId)
    const status = toNonEmptyString(payload?.status)

    if (jobId || status) {
      await saveCrmGitlabSyncContextIfAuthenticated(event, { jobId, status })
    }
  }

  const syncJobId = extractSyncJobIdPath(path)
  if (syncJobId) {
    const payload = asRecord(response.data)
    const applicationSlug = toNonEmptyString(payload?.applicationSlug)
    const owner = toNonEmptyString(payload?.owner)
    const status = toNonEmptyString(payload?.status)
    const id = toNonEmptyString(payload?.id)

    if (id || applicationSlug || owner || status) {
      await saveCrmGitlabSyncContextIfAuthenticated(event, {
        jobId: id ?? syncJobId,
        applicationSlug,
        owner,
        status,
      })
    }
  }

  await invalidateMutationCaches(event, CRM_GITLAB_MUTATION_KEY)
  await invalidateCrmGitlabPrefixes(event, buildCrmGitlabMutationPrefixes(path))

  return response.data
}
