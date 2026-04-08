import type { H3Event } from 'h3'
import type { SessionUser } from '~/types/session'
import type { ApiObject, ApiQuery, ApiResponse } from '../types/api/common'
import { buildCacheKey, getCached, setCached } from './apiCache'
import { resolveCacheDomain, resolveCacheTtl, type CacheDomain } from './apiCacheConfig'
import { resolveApiUrl } from './resolveApiUrl'

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

type PrivateApiOptions<TPayload extends ApiObject = ApiObject> = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: BodyInit | TPayload | null
  query?: ApiQuery
}

type CachedPrivateGetOptions = {
  query?: ApiQuery
  cacheDomain?: CacheDomain
}

export async function callPrivateApi<
  TResponse extends ApiResponse,
  TPayload extends ApiObject = ApiObject,
>(
  event: H3Event,
  endpoint: string,
  options?: PrivateApiOptions<TPayload>,
): Promise<TResponse> {
  const runtimeConfig = useRuntimeConfig(event)
  const { token } = await getSessionAuth(event)
  const requestHeaders = new Headers()
  requestHeaders.set('accept', 'application/json')
  requestHeaders.set('Authorization', `Bearer ${token}`)

  return $fetch<TResponse>(
    resolveApiUrl(runtimeConfig.public.apiBaseUrl, endpoint),
    {
      ...options,
      headers: requestHeaders,
    },
  )
}

export async function cachedPrivateGet<TResponse extends ApiResponse>(
  event: H3Event,
  endpoint: string,
  options?: CachedPrivateGetOptions,
): Promise<TResponse> {
  const { username } = await getSessionAuth(event)
  const cacheKey = buildCacheKey({
    scope: 'private',
    endpoint,
    query: options?.query,
    username,
  })

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
