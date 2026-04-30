import type { H3Event } from 'h3'
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type RawAxiosRequestHeaders,
} from 'axios'
import axiosRetry from 'axios-retry'

const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504])

function normalizeBase(baseUrl: string) {
  return baseUrl.replace(/\/+$/, '')
}

function isAbsoluteUrl(endpoint: string) {
  return /^https?:\/\//i.test(endpoint)
}

function normalizeEndpoint(endpoint: string) {
  if (isAbsoluteUrl(endpoint)) return endpoint
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`
}

function resolveApiPath(baseUrl: string, endpoint: string) {
  const normalizedBase = normalizeBase(baseUrl)
  const normalizedEndpoint = normalizeEndpoint(endpoint)

  if (
    normalizedBase.endsWith('/api/v1') &&
    normalizedEndpoint.startsWith('/api/v1/')
  ) {
    return normalizedEndpoint.slice('/api/v1'.length)
  }

  return normalizedEndpoint
}

function createAxiosInstance(config: AxiosRequestConfig): AxiosInstance {
  const instance = axios.create(config)

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

function getBaseUrl(event: H3Event) {
  const runtimeConfig = useRuntimeConfig(event)
  return normalizeBase(runtimeConfig.public.apiBaseUrl)
}

export function resolveServerApiUrl(event: H3Event, endpoint: string) {
  if (isAbsoluteUrl(endpoint)) {
    return endpoint
  }

  const baseUrl = getBaseUrl(event)
  return `${baseUrl}${resolveApiPath(baseUrl, endpoint)}`
}

export function getServerPublicAxios(event: H3Event) {
  return createAxiosInstance({
    baseURL: getBaseUrl(event),
    headers: {
      accept: 'application/json',
    },
  })
}

export async function getServerPrivateAxios(
  event: H3Event,
  options?: { headers?: HeadersInit },
) {
  const { user } = await requireUserSession(event)
  const token = (user as { token?: string } | null)?.token?.trim()

  if (!token || token === 'undefined' || token === 'null') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing authentication token',
    })
  }

  const headers: RawAxiosRequestHeaders = {
    accept: 'application/json',
  }

  if (options?.headers) {
    Object.assign(
      headers,
      Object.fromEntries(new Headers(options.headers).entries()),
    )
  }

  headers.Authorization = `Bearer ${token}`

  return createAxiosInstance({
    baseURL: getBaseUrl(event),
    headers,
  })
}
