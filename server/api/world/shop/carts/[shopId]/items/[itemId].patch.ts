import {
  getServerPrivateAxios,
  resolveServerApiUrl,
} from '~~/server/utils/http/axiosClient'
import {
  assertShopNonEmptyString,
  assertShopPositiveInteger,
  rethrowShopProxyError,
} from '~~/server/utils/shopProxy'

type Body = {
  quantity?: number
}

export default defineEventHandler(async (event) => {
  const { shopId, itemId } = getRouterParams(event)
  const normalizedShopId = assertShopNonEmptyString(shopId, 'shopId')
  const normalizedItemId = assertShopNonEmptyString(itemId, 'itemId')
  const body = await readBody<Body>(event)
  const quantity = assertShopPositiveInteger(body?.quantity, 'quantity')

  try {
    const client = await getServerPrivateAxios(event)
    const response = await client.patch(
      resolveServerApiUrl(
        event,
        `/shop/general/carts/${encodeURIComponent(normalizedShopId)}/items/${encodeURIComponent(normalizedItemId)}`,
      ),
      { quantity },
    )

    return response.data
  } catch (error) {
    rethrowShopProxyError(error, 'Unable to update cart item')
  }
})
