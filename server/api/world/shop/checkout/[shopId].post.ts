import crypto from 'node:crypto'
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
  const shopId = assertShopNonEmptyString(
    routerShopId,
    'shopId',
  )
  const requestIdHeader = getHeader(event, 'x-request-id')
  const requestId =
    typeof requestIdHeader === 'string' && requestIdHeader.trim().length > 0
      ? requestIdHeader.trim()
      : crypto.randomUUID()

  try {
    const client = await getServerPrivateAxios(event, {
      headers: {
        'x-request-id': requestId,
      },
    })

    const response = await client.post(
      resolveServerApiUrl(
        event,
        `/shop/general/checkout/${encodeURIComponent(shopId)}`,
      ),
    )

    return response.data
  } catch (error) {
    rethrowShopProxyError(error, 'Unable to checkout cart')
  }
})
