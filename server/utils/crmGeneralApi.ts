import type { H3Event } from 'h3'
import { getCached, publicCacheKey, setCached } from './apiCache'
import { resolveCacheTtl } from './apiCacheConfig'

const CRM_BASE_URL = 'https://bro-world.org/api/v1/crm'

type CrmGeneralMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

interface CrmGeneralFetchOptions {
  method?: CrmGeneralMethod
  body?: Record<string, unknown>
  query?: Record<string, string | number | boolean | undefined>
}

export async function fetchCrmGeneral<T = unknown>(
  event: H3Event,
  path: string,
  options: CrmGeneralFetchOptions = {},
): Promise<T> {
  const method = options.method ?? 'GET'
  const query = options.query
  const endpoint = `/api/v1/crm/${path}`

  if (method === 'GET') {
    const cacheKey = publicCacheKey(endpoint, query)
    const cached = await getCached<T>(cacheKey)
    if (cached) {
      return cached
    }

    const response = await $fetch<T>(`${CRM_BASE_URL}/${path}`, {
      method,
      query,
    })
    await setCached(cacheKey, response, resolveCacheTtl('crm'))
    return response
  }

  return await $fetch<T>(`${CRM_BASE_URL}/${path}`, {
    method,
    body: options.body,
    query,
  })
}
