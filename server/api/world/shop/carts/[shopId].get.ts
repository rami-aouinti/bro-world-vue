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

  try {
    const client = await getServerPrivateAxios(event)
    const response = await client.get(
      resolveServerApiUrl(
        event,
        `/api/v1/shop/carts/${encodeURIComponent(normalizedShopId)}`,
      ),
    )

    return response.data
  } catch (error) {
    rethrowShopProxyError(error, 'Unable to fetch cart')
  }
})
