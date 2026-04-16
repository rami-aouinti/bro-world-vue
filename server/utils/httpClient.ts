import axios, { type AxiosError } from 'axios'
import axiosRetry from 'axios-retry'
import type { ApiObject, ApiQuery } from '../types/api/common'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: HeadersInit
  query?: ApiQuery
  body?: BodyInit | ApiObject | null
}

const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504])

function createClient() {
  const instance = axios.create({
    headers: {
      accept: 'application/json',
    },
  })

  axiosRetry(instance, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error: AxiosError) => {
      const status = error.response?.status
      return (
        axiosRetry.isNetworkError(error) ||
        (typeof status === 'number' && RETRYABLE_STATUS_CODES.has(status))
      )
    },
  })

  return instance
}

/**
 * @deprecated Use server/utils/http/axiosClient.ts directly.
 */
export async function apiRequest<TResponse>(
  url: string,
  options?: RequestOptions,
): Promise<TResponse> {
  const client = createClient()
  const response = await client.request<TResponse>({
    url,
    method: options?.method ?? 'GET',
    headers: options?.headers
      ? Object.fromEntries(new Headers(options.headers).entries())
      : undefined,
    params: options?.query,
    data: options?.body,
  })

  return response.data
}
