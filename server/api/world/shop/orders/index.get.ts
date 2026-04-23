import {
  getServerPrivateAxios,
  resolveServerApiUrl,
} from '~~/server/utils/http/axiosClient'
import { rethrowShopProxyError } from '~~/server/utils/shopProxy'

export default defineEventHandler(async (event) => {
  try {
    const client = await getServerPrivateAxios(event)
    const response = await client.get(
      resolveServerApiUrl(event, '/api/v1/shop/orders'),
    )

    return response.data
  } catch (error) {
    rethrowShopProxyError(error, 'Unable to fetch orders')
  }
})
