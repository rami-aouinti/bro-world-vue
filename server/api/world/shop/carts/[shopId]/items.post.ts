import {
  getServerPrivateAxios,
  resolveServerApiUrl,
} from '~~/server/utils/http/axiosClient'

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

  const client = await getServerPrivateAxios(event)
  const response = await client.post(
    resolveServerApiUrl(
      event,
      `/shop/general/carts/${encodeURIComponent(normalizedShopId)}/items`,
    ),
    {
      productId,
      quantity,
    },
  )

  return response.data
})
