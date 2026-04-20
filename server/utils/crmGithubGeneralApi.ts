import type { H3Event } from 'h3'
import { getCached, privateCacheKey, setCached } from './apiCache'
import { resolveCacheTtl } from './apiCacheConfig'
import { getServerPrivateAxios, resolveServerApiUrl } from './http/axiosClient'
import { invalidateMutationCaches } from './mutationInvalidation'
import { getSessionAuth } from './privateApi'

const CRM_GENERAL_BASE_ENDPOINT = '/crm/general'
const CRM_GENERAL_PUBLIC_BASE_URL = 'https://bro-world.org/api/v1/crm/general'
const CRM_GITHUB_MUTATION_KEY = 'crm:general:mutate'
const MONTH_IN_SECONDS = 30 * 24 * 60 * 60
const CRM_GITHUB_SYNC_CONTEXT_ENDPOINT = 'crm/general/github/sync/context'

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

  await setCached(cacheKey, response, resolveCacheTtl('crm'))

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

  return response.data
}
