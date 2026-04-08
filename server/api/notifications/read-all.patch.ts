import { callPrivateApi } from '../../utils/privateApi'
import type { NotificationsApiResponse } from '~~/server/types/api/notifications'

export default defineEventHandler(
  async (event): Promise<NotificationsApiResponse> => {
    return callPrivateApi<NotificationsApiResponse>(
      event,
      '/notifications/read-all',
      {
        method: 'PATCH',
      },
    )
  },
)
