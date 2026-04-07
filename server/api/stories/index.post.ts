import { getSessionToken } from '../../utils/privateApi'
import { resolveApiUrl } from '../../utils/resolveApiUrl'

export default defineEventHandler(async (event): Promise<unknown> => {
  const runtimeConfig = useRuntimeConfig(event)
  const token = await getSessionToken(event)
  const contentType = getHeader(event, 'content-type')
  const body = await readRawBody(event, false)

  const requestHeaders = new Headers()
  requestHeaders.set('accept', 'application/json')
  requestHeaders.set('Authorization', `Bearer ${token}`)

  if (contentType) {
    requestHeaders.set('content-type', contentType)
  }

  return $fetch(resolveApiUrl(runtimeConfig.public.apiBaseUrl, '/api/v1/private/stories'), {
    method: 'POST',
    headers: requestHeaders,
    body,
  })
})
