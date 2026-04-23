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
  productId?: string
  quantity?: number
}

export default defineEventHandler(async (event) => {
  const routerShopId =
    getRouterParam(event, 'shopId') ?? getRouterParam(event, 'shopid')
  const normalizedShopId = assertShopNonEmptyString(routerShopId, 'shopId')
  const body = await readBody<Body>(event)
  const productId = assertShopNonEmptyString(body?.productId, 'productId')
  const quantity = assertShopPositiveInteger(body?.quantity ?? 1, 'quantity')

  try {
    const client = await getServerPrivateAxios(event)
    const response = await client.post(
      resolveServerApiUrl(
        event,
        `/api/v1/shop/carts/${encodeURIComponent(normalizedShopId)}/items`,
      ),
      {
        productId,
        quantity,
      },
    )

    return response.data
  } catch (error) {
    rethrowShopProxyError(error, 'Unable to add cart item')
  }
})
