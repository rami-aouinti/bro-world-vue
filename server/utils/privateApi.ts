import type { SessionUser } from '~/types/session'
import type { H3Event } from 'h3'
import { resolveApiUrl } from './resolveApiUrl'

export function getSessionToken(event: H3Event) {
  const session = requireUserSession(event)

  return session.then(({ user }) => {
    const token = (user as SessionUser | null)?.token?.trim()

    if (!token || token === 'undefined' || token === 'null') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Missing authentication token',
      })
    }

    return token
  })
}

type PrivateApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: BodyInit | Record<string, unknown> | null
  query?: Record<string, string | number | boolean | undefined>
}

export async function callPrivateApi<T>(event: H3Event, endpoint: string, options?: PrivateApiOptions): Promise<T> {
  const runtimeConfig = useRuntimeConfig(event)
  const token = await getSessionToken(event)
  const requestHeaders = new Headers()
  requestHeaders.set('accept', 'application/json')
  requestHeaders.set('Authorization', `Bearer ${token}`)

  return $fetch<T>(resolveApiUrl(runtimeConfig.public.apiBaseUrl, endpoint), {
    ...options,
    headers: requestHeaders,
  })
}
