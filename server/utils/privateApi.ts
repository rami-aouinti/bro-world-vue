import type { H3Event } from 'h3'
import type { SessionUser } from '~/types/session'
import type { ApiObject, ApiQuery, ApiResponse } from '../types/api/common'
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

type PrivateApiOptions<TPayload extends ApiObject = ApiObject> = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: BodyInit | TPayload | null
  query?: ApiQuery
}

export async function callPrivateApi<
  TResponse extends ApiResponse,
  TPayload extends ApiObject = ApiObject,
>(
  event: H3Event,
  endpoint: string,
  options?: PrivateApiOptions<TPayload>,
): Promise<TResponse> {
  const runtimeConfig = useRuntimeConfig(event)
  const token = await getSessionToken(event)
  const requestHeaders = new Headers()
  requestHeaders.set('accept', 'application/json')
  requestHeaders.set('Authorization', `Bearer ${token}`)

  return $fetch<TResponse>(
    resolveApiUrl(runtimeConfig.public.apiBaseUrl, endpoint),
    {
      ...options,
      headers: requestHeaders,
    },
  )
}
