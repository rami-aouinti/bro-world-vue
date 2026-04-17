import {
  getServerPrivateAxios,
  resolveServerApiUrl,
} from '~~/server/utils/http/axiosClient'
import {
  assertShopNonEmptyString,
  rethrowShopProxyError,
} from '~~/server/utils/shopProxy'

export default defineEventHandler(async (event) => {
  const orderId = assertShopNonEmptyString(
    getRouterParam(event, 'orderId'),
    'orderId',
  )

  try {
    const client = await getServerPrivateAxios(event)
    const response = await client.post(
      resolveServerApiUrl(
        event,
        `/shop/general/orders/${encodeURIComponent(orderId)}/payment-confirm`,
      ),
    )

    return response.data
  } catch (error) {
    rethrowShopProxyError(error, 'Unable to confirm payment')
  }
})
