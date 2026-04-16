import {
  getServerPrivateAxios,
  resolveServerApiUrl,
} from '~~/server/utils/http/axiosClient'

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

  const client = await getServerPrivateAxios(event)
  const response = await client.get(
    resolveServerApiUrl(
      event,
      `/shop/general/carts/${encodeURIComponent(normalizedShopId)}`,
    ),
  )

  return response.data
})
