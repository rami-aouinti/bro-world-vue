import { apiRequest } from '~~/server/utils/httpClient'
import { getSessionToken } from '~~/server/utils/privateApi'
import { resolveApiUrl } from '~~/server/utils/resolveApiUrl'

function assertNonEmptyString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createError({
      statusCode: 422,
      statusMessage: `${field} is required`,
    })
  }

  return value.trim()
}

export default defineEventHandler(async (event) => {
  const { shopId } = getRouterParams(event)
  const normalizedShopId = assertNonEmptyString(shopId, 'shopId')

  const runtimeConfig = useRuntimeConfig(event)
  const token = await getSessionToken(event)

  return apiRequest(
    resolveApiUrl(
      runtimeConfig.public.apiBaseUrl,
      `/shop/general/carts/${encodeURIComponent(normalizedShopId)}`,
    ),
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${token}`,
      },
    },
  )
})
