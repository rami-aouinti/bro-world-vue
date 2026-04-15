import type { ApiObject, ApiQuery } from '../types/api/common'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: HeadersInit
  query?: ApiQuery
  body?: BodyInit | ApiObject | null
}

const RETRYABLE_STATUS_CODES = [408, 425, 429, 500, 502, 503, 504]

function headersToRecord(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {}

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries())
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers)
  }

  return Object.entries(headers).reduce<Record<string, string>>((acc, [key, value]) => {
    if (typeof value === 'string') {
      acc[key] = value
    }
    return acc
  }, {})
}

function withQuery(url: string, query?: ApiQuery): string {
  if (!query) return url

  const nextUrl = new URL(url)
  Object.entries(query).forEach(([key, value]) => {
    if (typeof value === 'undefined' || value === null) return

    if (Array.isArray(value)) {
      value.forEach((entry) => nextUrl.searchParams.append(key, String(entry)))
      return
    }

    nextUrl.searchParams.set(key, String(value))
  })

  return nextUrl.toString()
}

export async function apiRequest<TResponse>(
  url: string,
  options?: RequestOptions,
): Promise<TResponse> {
  const method = options?.method ?? 'GET'
  const headers = headersToRecord(options?.headers)
  const fullUrl = withQuery(url, options?.query)
  const maxRetries = 3
  const hasBody = typeof options?.body !== 'undefined' && options?.body !== null
  const isBodyInit
    = hasBody
      && (
        options?.body instanceof FormData
        || typeof options?.body === 'string'
        || options?.body instanceof URLSearchParams
        || options?.body instanceof Blob
      )
  const body
    = hasBody && !isBodyInit ? JSON.stringify(options?.body) : (options?.body as BodyInit | null | undefined)

  if (hasBody && !isBodyInit && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(fullUrl, {
        method,
        headers,
        body,
      })

      if (!response.ok) {
        if (
          RETRYABLE_STATUS_CODES.includes(response.status)
          && attempt < maxRetries
        ) {
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 300))
          continue
        }

        throw createError({
          statusCode: response.status,
          statusMessage: `API request failed: ${response.statusText}`,
        })
      }

      return (await response.json()) as TResponse
    } catch (error) {
      if (attempt >= maxRetries) {
        throw error
      }

      await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 300))
    }
  }

  throw createError({
    statusCode: 500,
    statusMessage: 'API request failed after retries',
  })
}
