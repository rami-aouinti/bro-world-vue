import {
  getServerPrivateAxios,
  resolveServerApiUrl,
} from '~~/server/utils/http/axiosClient'
import {
  assertShopNonEmptyString,
  rethrowShopProxyError,
} from '~~/server/utils/shopProxy'

export default defineEventHandler(async (event) => {
  const { shopId, itemId } = getRouterParams(event)
  const normalizedShopId = assertShopNonEmptyString(shopId, 'shopId')
  const normalizedItemId = assertShopNonEmptyString(itemId, 'itemId')

  try {
    const client = await getServerPrivateAxios(event)
    const response = await client.delete(
      resolveServerApiUrl(
        event,
        `/shop/general/carts/${encodeURIComponent(normalizedShopId)}/items/${encodeURIComponent(normalizedItemId)}`,
      ),
    )

    return response.data
  } catch (error) {
    rethrowShopProxyError(error, 'Unable to delete cart item')
  }
})
