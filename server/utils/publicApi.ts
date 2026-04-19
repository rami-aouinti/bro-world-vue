import type { H3Event } from 'h3'
import type { ApiQuery, ApiResponse } from '../types/api/common'
import { getCached, publicCacheKey, setCached } from './apiCache'
import { getPersistentCached, setPersistentCached } from './persistentApiCache'
import {
  resolveCacheDomain,
  resolveCacheTtl,
  type CacheDomain,
} from './apiCacheConfig'
import { getServerPublicAxios, resolveServerApiUrl } from './http/axiosClient'

type PublicApiOptions = {
  query?: ApiQuery
}

type CachedPublicGetOptions = PublicApiOptions & {
  cacheDomain?: CacheDomain
  ttlSeconds?: number
  persistent?: boolean
}

/**
 * @deprecated Use server/utils/http/axiosClient.ts directly.
 */
export async function callPublicApi<TResponse extends ApiResponse>(
  event: H3Event,
  endpoint: string,
  options?: PublicApiOptions,
): Promise<TResponse> {
  const client = getServerPublicAxios(event)
  const response = await client.get<TResponse>(resolveServerApiUrl(event, endpoint), {
    params: options?.query,
  })

  return response.data
}

/**
 * @deprecated Use server/utils/http/axiosClient.ts directly.
 */
export async function cachedPublicGet<TResponse extends ApiResponse>(
  event: H3Event,
  endpoint: string,
  options?: CachedPublicGetOptions,
): Promise<TResponse> {
  const cacheKey = publicCacheKey(endpoint, options?.query)
  const domain = options?.cacheDomain ?? resolveCacheDomain(endpoint)
  const ttl = options?.ttlSeconds ?? resolveCacheTtl(domain)

  const cached = await getCached<TResponse>(cacheKey)
  if (cached) {
    return cached
  }

  if (options?.persistent) {
    const persistentCached = await getPersistentCached<TResponse>(cacheKey)
    if (persistentCached) {
      await setCached(cacheKey, persistentCached, ttl)
      return persistentCached
    }
  }

  const response = await callPublicApi<TResponse>(event, endpoint, {
    query: options?.query,
  })

  await Promise.all([
    setCached(cacheKey, response, ttl),
    options?.persistent
      ? setPersistentCached(cacheKey, response, ttl)
      : Promise.resolve(),
  ])

  return response
}
