import type { H3Event } from 'h3'
import type { ApiQuery, ApiResponse } from '../types/api/common'
import { buildCacheKey, getCached, setCached } from './apiCache'
import { resolveCacheDomain, resolveCacheTtl, type CacheDomain } from './apiCacheConfig'
import { resolveApiUrl } from './resolveApiUrl'

type PublicApiOptions = {
  query?: ApiQuery
}

type CachedPublicGetOptions = PublicApiOptions & {
  cacheDomain?: CacheDomain
}

export async function callPublicApi<TResponse extends ApiResponse>(
  event: H3Event,
  endpoint: string,
  options?: PublicApiOptions,
): Promise<TResponse> {
  const runtimeConfig = useRuntimeConfig(event)

  return $fetch<TResponse>(resolveApiUrl(runtimeConfig.public.apiBaseUrl, endpoint), {
    method: 'GET',
    query: options?.query,
    headers: {
      accept: 'application/json',
    },
  })
}

export async function cachedPublicGet<TResponse extends ApiResponse>(
  event: H3Event,
  endpoint: string,
  options?: CachedPublicGetOptions,
): Promise<TResponse> {
  const cacheKey = buildCacheKey({
    scope: 'public',
    endpoint,
    query: options?.query,
  })

  const cached = await getCached<TResponse>(cacheKey)
  if (cached) {
    return cached
  }

  const response = await callPublicApi<TResponse>(event, endpoint, {
    query: options?.query,
  })

  const domain = options?.cacheDomain ?? resolveCacheDomain(endpoint)
  await setCached(cacheKey, response, resolveCacheTtl(domain))

  return response
}
