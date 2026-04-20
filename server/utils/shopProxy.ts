import { isAxiosError } from 'axios'

const PASSTHROUGH_STATUS_CODES = new Set([400, 401, 403, 404, 422])

export function assertShopNonEmptyString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createError({
      statusCode: 422,
      statusMessage: `${field} is required`,
    })
  }

  return value.trim()
}

export function assertShopPositiveInteger(value: unknown, field: string) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw createError({
      statusCode: 422,
      statusMessage: `${field} must be a positive number`,
    })
  }

  return Math.floor(parsed)
}

function resolveStatusMessage(error: unknown, fallback: string) {
  if (!isAxiosError(error)) return fallback

  const responseData = error.response?.data
  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData
  }

  if (responseData && typeof responseData === 'object') {
    const message =
      (responseData as { statusMessage?: unknown }).statusMessage ??
      (responseData as { message?: unknown }).message ??
      (responseData as { error?: unknown }).error

    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  return error.message || fallback
}

export function rethrowShopProxyError(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const statusCode = error.response?.status

    if (statusCode && PASSTHROUGH_STATUS_CODES.has(statusCode)) {
      throw createError({
        statusCode,
        statusMessage: resolveStatusMessage(error, fallback),
      })
    }
  }

  throw error
}
