import { mutatingPrivateApiCall } from '../../utils/privateApi'
import type { NotificationsApiResponse } from '~~/server/types/api/notifications'

export default defineEventHandler(
  async (event): Promise<NotificationsApiResponse> => {
    return mutatingPrivateApiCall<NotificationsApiResponse>(
      event,
      '/notifications/read-all',
      {
        mutationKey: 'notifications:read-all',
        method: 'PATCH',
      },
    )
  },
)
