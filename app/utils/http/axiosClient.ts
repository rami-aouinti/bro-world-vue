import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import axiosRetry from 'axios-retry'
import { createMissingSessionTokenError } from '~/composables/useSessionReady'
import { resolveAuthToken, type SessionUserWithToken } from './authToken'

const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504])

let publicAxiosInstance: AxiosInstance | null = null
let privateAxiosInstance: AxiosInstance | null = null

function resolveApiBaseUrl(baseUrl: string): string {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '')

  if (import.meta.client) {
    try {
      const url = new URL(normalizedBaseUrl)
      return url.pathname.replace(/\/+$/, '') || '/'
    } catch {
      return normalizedBaseUrl
    }
  }

  return normalizedBaseUrl
}

export function normalizeAxiosRequestUrl(
  baseUrl: string,
  requestUrl?: string,
): string | undefined {
  if (!requestUrl) {
    return requestUrl
  }

  if (!requestUrl.startsWith('/')) {
    return requestUrl
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '')

  if (
    normalizedBaseUrl.endsWith('/api/v1') &&
    requestUrl.startsWith('/api/v1/')
  ) {
    return requestUrl.slice('/api/v1'.length)
  }

  if (normalizedBaseUrl.endsWith('/api/v1') && requestUrl.startsWith('/api/')) {
    return requestUrl.slice('/api'.length)
  }

  return requestUrl
}

function createAxiosInstance(config?: AxiosRequestConfig): AxiosInstance {
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

function ensureInstances() {
  const runtimeConfig = useRuntimeConfig()
  const baseURL = resolveApiBaseUrl(runtimeConfig.public.apiBaseUrl)

  const attachUrlNormalizer = (instance: AxiosInstance) => {
    instance.interceptors.request.use((config) => {
      config.url = normalizeAxiosRequestUrl(baseURL, config.url)
      return config
    })
  }

  if (!publicAxiosInstance) {
    publicAxiosInstance = createAxiosInstance({
      baseURL,
      headers: {
        accept: 'application/json',
      },
    })

    attachUrlNormalizer(publicAxiosInstance)
  }

  if (!privateAxiosInstance) {
    const { user, fetch: fetchUserSession } = useUserSession()
    let sessionReadyPromise: Promise<void> | null = null
    let sessionInitialized = false
    const ensureSessionReady = async (options?: { forceRefresh?: boolean }) => {
      if (import.meta.server) {
        return
      }

      const forceRefresh = options?.forceRefresh === true
      if (forceRefresh) {
        sessionInitialized = false
        sessionReadyPromise = null
      }

      if (sessionInitialized) {
        return
      }

      if (!sessionReadyPromise) {
        sessionReadyPromise = (async () => {
          await fetchUserSession()
          sessionInitialized = true
        })().finally(() => {
          sessionReadyPromise = null
        })
      }

      await sessionReadyPromise
    }

    privateAxiosInstance = createAxiosInstance({
      baseURL,
      headers: {
        accept: 'application/json',
      },
    })

    attachUrlNormalizer(privateAxiosInstance)

    privateAxiosInstance.interceptors.request.use(
      async (
        config: InternalAxiosRequestConfig & { _sessionRefreshed?: boolean },
      ) => {
        await ensureSessionReady()
        const token = resolveAuthToken(
          user.value as SessionUserWithToken | null,
        )

        if (!token) {
          throw createMissingSessionTokenError()
        }

        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${token}`

        return config
      },
    )

    privateAxiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const status = error.response?.status
        const requestConfig = error.config as
          | (InternalAxiosRequestConfig & { _sessionRefreshed?: boolean })
          | undefined

        if (
          status !== 401 ||
          !requestConfig ||
          requestConfig._sessionRefreshed
        ) {
          throw error
        }

        requestConfig._sessionRefreshed = true

        await ensureSessionReady({ forceRefresh: true })
        const token = resolveAuthToken(
          user.value as SessionUserWithToken | null,
        )

        if (!token) {
          throw createMissingSessionTokenError()
        }

        requestConfig.headers = requestConfig.headers ?? {}
        requestConfig.headers.Authorization = `Bearer ${token}`

        return (privateAxiosInstance as AxiosInstance).request(requestConfig)
      },
    )
  }
}

export function useAxiosClients() {
  ensureInstances()

  return {
    publicAxios: publicAxiosInstance as AxiosInstance,
    privateAxios: privateAxiosInstance as AxiosInstance,
  }
}

export function usePublicAxios() {
  return useAxiosClients().publicAxios
}

export function usePrivateAxios() {
  return useAxiosClients().privateAxios
}
