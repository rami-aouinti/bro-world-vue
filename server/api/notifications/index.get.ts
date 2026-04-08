import { cachedPrivateGet } from '../../utils/privateApi'
import type { NotificationsApiResponse } from '~~/server/types/api/notifications'

export default defineEventHandler(
  async (event): Promise<NotificationsApiResponse> => {
    const query = getQuery(event)

    const limit = Number(query.limit ?? 20)
    const offset = Number(query.offset ?? 0)

    return cachedPrivateGet<NotificationsApiResponse>(event, '/notifications', {
      query: { limit, offset },
      cacheDomain: 'notifications',
    })
  },
)
