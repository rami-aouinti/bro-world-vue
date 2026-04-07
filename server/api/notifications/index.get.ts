import { getSessionToken } from '../../utils/privateApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  const runtimeConfig = useRuntimeConfig(event)
  const token = await getSessionToken(event)
  const query = getQuery(event)

  const limit = Number(query.limit ?? 20)
  const offset = Number(query.offset ?? 0)

  const requestHeaders = new Headers()
  requestHeaders.set('accept', 'application/json')
  requestHeaders.set('Authorization', `Bearer ${token}`)

  return $fetch(`${runtimeConfig.public.apiBaseUrl}/notifications`, {
    headers: requestHeaders,
    query: {
      limit,
      offset,
    },
  })
})
