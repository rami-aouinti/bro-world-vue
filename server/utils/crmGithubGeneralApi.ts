import type { H3Event } from 'h3'
import { getCached, invalidateByPrefix, privateCacheKey, setCached } from './apiCache'
import { resolveCacheTtl } from './apiCacheConfig'
import { getServerPrivateAxios, resolveServerApiUrl } from './http/axiosClient'
import { invalidateMutationCaches } from './mutationInvalidation'
import { getSessionAuth } from './privateApi'

const CRM_GENERAL_BASE_ENDPOINT = '/crm/general'
const CRM_GENERAL_PUBLIC_BASE_URL = 'https://bro-world.org/api/v1/crm/general'
const CRM_GITHUB_MUTATION_KEY = 'crm:general:mutate'
const MONTH_IN_SECONDS = 30 * 24 * 60 * 60
const CRM_GITHUB_SYNC_CONTEXT_ENDPOINT = 'crm/general/github/sync/context'
const CRM_CACHE_PREFIX = 'crm'

const CRM_GITHUB_TTL_BY_PATH: Array<{ pattern: RegExp; ttl: number }> = [
  { pattern: /^projects\/[^/]+\/github\/(commits|branches|pull-requests|collaborators)(\/|$)/, ttl: 60 },
  { pattern: /^projects\/[^/]+\/github\/actions\/workflows(\/|$)/, ttl: 180 },
  { pattern: /^projects\/[^/]+\/github\/actions\/runs(\/|$)/, ttl: 45 },
]

export type CrmGithubSyncContext = {
  jobId?: string
  applicationSlug?: string
  owner?: string
  status?: string
  updatedAt: string
}

function isBootstrapPath(path: string) {
  return path.replace(/^\/+/, '') === 'github/sync/bootstrap'
}

function extractSyncJobIdPath(path: string) {
  const normalizedPath = path.replace(/^\/+/, '')
  const match = normalizedPath.match(/^github\/sync\/jobs\/([^/]+)$/)
  return match?.[1] ?? null
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

function toNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

async function getSyncContextCacheKey(event: H3Event) {
  const { username } = await getSessionAuth(event)
  return privateCacheKey(username, CRM_GITHUB_SYNC_CONTEXT_ENDPOINT)
}

export async function getCrmGithubSyncContext(event: H3Event) {
  const cacheKey = await getSyncContextCacheKey(event)
  return await getCached<CrmGithubSyncContext>(cacheKey)
}

async function saveCrmGithubSyncContext(
  event: H3Event,
  context: Partial<CrmGithubSyncContext>,
) {
  const cacheKey = await getSyncContextCacheKey(event)
  const previous = (await getCached<CrmGithubSyncContext>(cacheKey)) ?? {
    updatedAt: new Date().toISOString(),
  }

  const nextContext: CrmGithubSyncContext = {
    ...previous,
    ...context,
    updatedAt: new Date().toISOString(),
  }

  await setCached(cacheKey, nextContext, MONTH_IN_SECONDS)

  return nextContext
}

async function saveCrmGithubSyncContextIfAuthenticated(
  event: H3Event,
  context: Partial<CrmGithubSyncContext>,
) {
  try {
    await saveCrmGithubSyncContext(event, context)
  } catch {
    // Ignore when request is unauthenticated; GET endpoints can be public.
  }
}

function crmGithubEndpoint(path: string) {
  const normalizedPath = path.replace(/^\/+/, '')
  return `${CRM_GENERAL_BASE_ENDPOINT}/${normalizedPath}`
}

function resolveCrmGithubGetTtl(path: string) {
  const normalizedPath = path.replace(/^\/+/, '')
  const override = CRM_GITHUB_TTL_BY_PATH.find(({ pattern }) => pattern.test(normalizedPath))
  return override?.ttl ?? resolveCacheTtl('crm')
}

function buildCrmPrivateEndpointPrefix(username: string, endpoint: string) {
  const normalizedUsername = username.trim()
  const normalizedEndpoint = endpoint.trim().replace(/^\/+|\/+$/g, '')
  return `api:private:${normalizedUsername}:${CRM_CACHE_PREFIX}:${normalizedEndpoint}:`
}

function buildCrmPublicEndpointPrefix(endpoint: string) {
  const normalizedEndpoint = endpoint.trim().replace(/^\/+|\/+$/g, '')
  return `api:public:${CRM_CACHE_PREFIX}:${normalizedEndpoint}:`
}

function buildCrmGithubMutationPrefixes(path: string) {
  const normalizedPath = path.replace(/^\/+/, '')
  const projectMatch = normalizedPath.match(/^projects\/([^/]+)\/github\/(.+)$/)

  if (!projectMatch) {
    return []
  }

  const [, projectId, resourcePath] = projectMatch
  const firstSegment = resourcePath.split('/')[0]
  if (!firstSegment) {
    return []
  }

  const projectRoot = `crm/general/projects/${projectId}/github`
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

async function invalidateCrmGithubPrefixes(
  event: H3Event,
  endpointPrefixes: string[],
) {
  if (!endpointPrefixes.length) {
    return
  }

  const session = await getSessionAuth(event).catch(() => null)

  await Promise.all(
    endpointPrefixes.flatMap((endpointPrefix) => {
      const prefixes = [buildCrmPublicEndpointPrefix(endpointPrefix)]

      if (session?.username) {
        prefixes.push(buildCrmPrivateEndpointPrefix(session.username, endpointPrefix))
      }

      return prefixes.map(prefix => invalidateByPrefix(prefix))
    }),
  )
}

export async function cachedCrmGithubGeneralGet<TResponse = unknown>(
  event: H3Event,
  path: string,
  query?: Record<string, unknown>,
): Promise<TResponse> {
  const normalizedPath = path.replace(/^\/+/, '')
  const endpoint = crmGithubEndpoint(path)
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
    : await $fetch<TResponse>(`${CRM_GENERAL_PUBLIC_BASE_URL}/${normalizedPath}`, {
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
      await saveCrmGithubSyncContextIfAuthenticated(event, {
        jobId: id ?? syncJobId,
        applicationSlug,
        owner,
        status,
      })
    }
  }

  await setCached(cacheKey, response, resolveCrmGithubGetTtl(path))

  return response
}

export async function mutateCrmGithubGeneral<TResponse = unknown>(
  event: H3Event,
  path: string,
  options: {
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: unknown
    query?: Record<string, unknown>
  },
): Promise<TResponse> {
  const endpoint = crmGithubEndpoint(path)
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
      await saveCrmGithubSyncContextIfAuthenticated(event, { jobId, status })
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
      await saveCrmGithubSyncContextIfAuthenticated(event, {
        jobId: id ?? syncJobId,
        applicationSlug,
        owner,
        status,
      })
    }
  }

  await invalidateMutationCaches(event, CRM_GITHUB_MUTATION_KEY)
  await invalidateCrmGithubPrefixes(event, buildCrmGithubMutationPrefixes(path))

  return response.data
}
