import { cachedPrivateGet } from '../../utils/privateApi'
import type { NotificationsApiResponse } from '~~/server/types/api/notifications'

export default defineEventHandler(
  async (event): Promise<NotificationsApiResponse> => {
    const notificationId = getRouterParam(event, 'notification')

    if (!notificationId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid notification id',
      })
    }

    return cachedPrivateGet<NotificationsApiResponse>(
      event,
      `/notifications/${notificationId}`,
      {
        cacheDomain: 'notifications',
      },
    )
  },
)
