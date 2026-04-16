import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import axiosRetry from 'axios-retry'
import { awaitSessionReady, createMissingSessionTokenError } from '~/composables/useSessionReady'
import { resolveAuthToken, type SessionUserWithToken } from './authToken'

const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504])

let publicAxiosInstance: AxiosInstance | null = null
let privateAxiosInstance: AxiosInstance | null = null

function resolveApiBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '')
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

  if (!publicAxiosInstance) {
    publicAxiosInstance = createAxiosInstance({
      baseURL,
      headers: {
        accept: 'application/json',
      },
    })
  }

  if (!privateAxiosInstance) {
    privateAxiosInstance = createAxiosInstance({
      baseURL,
      headers: {
        accept: 'application/json',
      },
    })

    privateAxiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig & { _sessionRefreshed?: boolean }) => {
        await awaitSessionReady()

        const { user } = useUserSession()
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

        if (status !== 401 || !requestConfig || requestConfig._sessionRefreshed) {
          throw error
        }

        requestConfig._sessionRefreshed = true

        await awaitSessionReady({ forceRefresh: true })

        const { user } = useUserSession()
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
