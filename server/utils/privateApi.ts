import type { H3Event } from 'h3'
import { isAxiosError } from 'axios'
import type { SessionUser } from '~/types/session'
import type { ApiObject, ApiQuery, ApiResponse } from '../types/api/common'
import { getCached, privateCacheKey, setCached } from './apiCache'
import {
  resolveCacheDomain,
  resolveCacheTtl,
  type CacheDomain,
} from './apiCacheConfig'
import { getServerPrivateAxios, resolveServerApiUrl } from './http/axiosClient'
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

type RecruitEndpointRewrite = {
  nextEndpoint: string
  legacyEndpoint: string
}

function rewriteRecruitEndpoint(
  endpoint: string,
): RecruitEndpointRewrite | null {
  const generalMatch = endpoint.match(/^\/api\/v1\/recruit\/general\/(.+)$/)
  if (generalMatch) {
    return {
      nextEndpoint: `/api/v1/recruit/${generalMatch[1]}`,
      legacyEndpoint: endpoint,
    }
  }

  const applicationScopedMatch = endpoint.match(
    /^\/api\/v1\/recruit\/applications\/[^/]+\/(.+)$/,
  )
  if (applicationScopedMatch) {
    return {
      nextEndpoint: `/api/v1/recruit/${applicationScopedMatch[1]}`,
      legacyEndpoint: endpoint,
    }
  }

  const pipelineMatch = endpoint.match(
    /^\/api\/v1\/recruit\/private\/[^/]+\/pipeline$/,
  )
  if (pipelineMatch) {
    return {
      nextEndpoint: '/api/v1/recruit/private/pipeline',
      legacyEndpoint: endpoint,
    }
  }

  return null
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
  const client = await getServerPrivateAxios(event, {
    headers: options?.headers,
  })

  const recruitRewrite = rewriteRecruitEndpoint(endpoint)
  const preferredEndpoint = recruitRewrite?.nextEndpoint ?? endpoint

  try {
    const response = await client.request<TResponse>({
      url: resolveServerApiUrl(event, preferredEndpoint),
      method: options?.method ?? 'GET',
      params: options?.query,
      data: options?.body,
    })

    return response.data
  } catch (error) {
    if (
      !recruitRewrite ||
      !isAxiosError(error) ||
      error.response?.status !== 404
    ) {
      throw error
    }

    const fallbackResponse = await client.request<TResponse>({
      url: resolveServerApiUrl(event, recruitRewrite.legacyEndpoint),
      method: options?.method ?? 'GET',
      params: options?.query,
      data: options?.body,
    })

    return fallbackResponse.data
  }
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
