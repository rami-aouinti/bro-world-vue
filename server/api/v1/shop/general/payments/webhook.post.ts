import { apiRequest } from '~~/server/utils/httpClient'
import { resolveApiUrl } from '~~/server/utils/resolveApiUrl'

type WebhookProvider = 'mock' | 'stripe' | 'paypal'

function normalizeProvider(value: unknown): WebhookProvider {
  if (typeof value !== 'string') {
    throw createError({
      statusCode: 422,
      statusMessage: 'provider query param is required',
    })
  }

  const normalized = value.trim().toLowerCase()
  if (normalized === 'mock' || normalized === 'stripe' || normalized === 'paypal') {
    return normalized
  }

  throw createError({
    statusCode: 422,
    statusMessage: 'provider must be one of: mock, stripe, paypal',
  })
}

export default defineEventHandler(async (event) => {
  const provider = normalizeProvider(getQuery(event).provider)
  const runtimeConfig = useRuntimeConfig(event)
  const rawBody = await readRawBody(event, 'utf8')

  if (!rawBody?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid JSON payload.',
      data: {
        message: 'Validation failed.',
        errors: [
          {
            field: 'payload',
            message: 'Invalid JSON payload.',
            code: 'INVALID_JSON',
          },
        ],
      },
    })
  }

  let parsedBody: unknown
  try {
    parsedBody = JSON.parse(rawBody)
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid JSON payload.',
      data: {
        message: 'Validation failed.',
        errors: [
          {
            field: 'payload',
            message: 'Invalid JSON payload.',
            code: 'INVALID_JSON',
          },
        ],
      },
    })
  }

  return apiRequest(
    resolveApiUrl(
      runtimeConfig.public.apiBaseUrl,
      '/shop/general/payments/webhook',
    ),
    {
      method: 'POST',
      query: { provider },
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsedBody),
    },
  )
})
