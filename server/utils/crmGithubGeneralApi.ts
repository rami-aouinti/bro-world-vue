import type { H3Event } from 'h3'
import { getCached, publicCacheKey, setCached } from './apiCache'
import { resolveCacheTtl } from './apiCacheConfig'
import { getServerPrivateAxios, resolveServerApiUrl } from './http/axiosClient'
import { invalidateMutationCaches } from './mutationInvalidation'

const CRM_GENERAL_BASE_ENDPOINT = '/crm/general'
const CRM_GITHUB_MUTATION_KEY = 'crm:general:github:mutate'

function crmGithubEndpoint(path: string) {
  const normalizedPath = path.replace(/^\/+/, '')
  return `${CRM_GENERAL_BASE_ENDPOINT}/${normalizedPath}`
}

export async function cachedCrmGithubGeneralGet<TResponse = unknown>(
  event: H3Event,
  path: string,
  query?: Record<string, unknown>,
): Promise<TResponse> {
  const endpoint = crmGithubEndpoint(path)
  const cacheKey = publicCacheKey(endpoint, query)

  const cached = await getCached<TResponse>(cacheKey)
  if (cached) {
    return cached
  }

  const client = await getServerPrivateAxios(event)
  const response = await client.get<TResponse>(resolveServerApiUrl(event, endpoint), {
    params: query,
  })

  await setCached(cacheKey, response.data, resolveCacheTtl('crm'))

  return response.data
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

  await invalidateMutationCaches(event, CRM_GITHUB_MUTATION_KEY)

  return response.data
}
