import type { H3Event } from 'h3'
import type { ApiQuery, ApiResponse } from '../types/api/common'
import { getCached, publicCacheKey, setCached } from './apiCache'
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
