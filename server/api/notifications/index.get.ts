import { getSessionToken } from '../../utils/privateApi'
import type { NotificationsApiResponse } from '~~/server/types/api/notifications'

export default defineEventHandler(
  async (event): Promise<NotificationsApiResponse> => {
    const runtimeConfig = useRuntimeConfig(event)
    const token = await getSessionToken(event)
    const query = getQuery(event)

    const limit = Number(query.limit ?? 20)
    const offset = Number(query.offset ?? 0)

    const requestHeaders = new Headers()
    requestHeaders.set('accept', 'application/json')
    requestHeaders.set('Authorization', `Bearer ${token}`)

    return $fetch<NotificationsApiResponse>(
      `${runtimeConfig.public.apiBaseUrl}/notifications`,
      {
        headers: requestHeaders,
        query: {
          limit,
          offset,
        },
      },
    )
  },
)
