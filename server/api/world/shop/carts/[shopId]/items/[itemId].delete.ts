import {
  getServerPrivateAxios,
  resolveServerApiUrl,
} from '~~/server/utils/http/axiosClient'
import {
  assertShopNonEmptyString,
  rethrowShopProxyError,
} from '~~/server/utils/shopProxy'

export default defineEventHandler(async (event) => {
  const routerShopId =
    getRouterParam(event, 'shopId') ?? getRouterParam(event, 'shopid')
  const normalizedShopId = assertShopNonEmptyString(routerShopId, 'shopId')
  const normalizedItemId = assertShopNonEmptyString(
    getRouterParam(event, 'itemId'),
    'itemId',
  )

  try {
    const client = await getServerPrivateAxios(event)
    const response = await client.delete(
      resolveServerApiUrl(
        event,
        `/api/v1/shop/carts/${encodeURIComponent(normalizedShopId)}/items/${encodeURIComponent(normalizedItemId)}`,
      ),
    )

    return response.data
  } catch (error) {
    rethrowShopProxyError(error, 'Unable to delete cart item')
  }
})
