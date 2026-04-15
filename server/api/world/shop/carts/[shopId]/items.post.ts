import { apiRequest } from '~~/server/utils/httpClient'
import { getSessionToken } from '~~/server/utils/privateApi'
import { resolveApiUrl } from '~~/server/utils/resolveApiUrl'

type Body = {
  productId?: string
  quantity?: number
}

function assertNonEmptyString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createError({
      statusCode: 422,
      statusMessage: `${field} is required`,
    })
  }

  return value.trim()
}

function assertPositiveInteger(value: unknown, field: string) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw createError({
      statusCode: 422,
      statusMessage: `${field} must be a positive number`,
    })
  }

  return Math.floor(parsed)
}

export default defineEventHandler(async (event) => {
  const { shopId } = getRouterParams(event)
  const normalizedShopId = assertNonEmptyString(shopId, 'shopId')
  const body = await readBody<Body>(event)
  const productId = assertNonEmptyString(body?.productId, 'productId')
  const quantity = assertPositiveInteger(body?.quantity ?? 1, 'quantity')

  const runtimeConfig = useRuntimeConfig(event)
  const token = await getSessionToken(event)

  return apiRequest(
    resolveApiUrl(
      runtimeConfig.public.apiBaseUrl,
      `/shop/general/carts/${encodeURIComponent(normalizedShopId)}/items`,
    ),
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: {
        productId,
        quantity,
      },
    },
  )
})
