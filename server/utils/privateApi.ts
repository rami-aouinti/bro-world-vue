import type { H3Event } from 'h3'
import type { SessionUser } from '~/types/session'
import type { ApiObject, ApiQuery, ApiResponse } from '../types/api/common'
import { getCached, privateCacheKey, setCached } from './apiCache'
import { resolveCacheDomain, resolveCacheTtl, type CacheDomain } from './apiCacheConfig'
import { resolveApiUrl } from './resolveApiUrl'
import { invalidateMutationCaches } from './mutationInvalidation'

export async function getSessionAuth(event: H3Event) {
  const { user } = await requireUserSession(event)
  const sessionUser = user as SessionUser | null

  const token = sessionUser?.token?.trim()
  const username = sessionUser?.username?.trim()

  if (!token || token === 'undefined' || token === 'null') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing authentication token',
    })
  }

  if (!username) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing authenticated username',
    })
  }

  return { token, username }
}

export function getSessionToken(event: H3Event) {
  return getSessionAuth(event).then(({ token }) => token)
}

type PrivateApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: BodyInit | ApiObject | null
  query?: ApiQuery
  headers?: HeadersInit
}

type CachedPrivateGetOptions = {
  query?: ApiQuery
  cacheDomain?: CacheDomain
}

export async function callPrivateApi<TResponse extends ApiResponse>(
  event: H3Event,
  endpoint: string,
  options?: PrivateApiOptions,
): Promise<TResponse> {
  const runtimeConfig = useRuntimeConfig(event)
  const { token } = await getSessionAuth(event)
  const requestHeaders = new Headers(options?.headers)
  requestHeaders.set('accept', 'application/json')
  requestHeaders.set('Authorization', `Bearer ${token}`)

  return $fetch<TResponse>(
    resolveApiUrl(runtimeConfig.public.apiBaseUrl, endpoint),
    {
      ...options,
      headers: requestHeaders,
    } as any,
  )
}

export async function cachedPrivateGet<TResponse extends ApiResponse>(
  event: H3Event,
  endpoint: string,
  options?: CachedPrivateGetOptions,
): Promise<TResponse> {
  const { username } = await getSessionAuth(event)
  const cacheKey = privateCacheKey(username, endpoint, options?.query)

  const cached = await getCached<TResponse>(cacheKey)
  if (cached) {
    return cached
  }

  const response = await callPrivateApi<TResponse>(event, endpoint, {
    method: 'GET',
    query: options?.query,
  })

  const domain = options?.cacheDomain ?? resolveCacheDomain(endpoint)
  await setCached(cacheKey, response, resolveCacheTtl(domain))

  return response
}

type MutatingPrivateApiOptions = PrivateApiOptions & {
  mutationKey: string
}

export async function mutatingPrivateApiCall<TResponse extends ApiResponse>(
  event: H3Event,
  endpoint: string,
  options: MutatingPrivateApiOptions,
): Promise<TResponse> {
  const response = await callPrivateApi<TResponse>(event, endpoint, options)
  await invalidateMutationCaches(event, options.mutationKey)
  return response
}
