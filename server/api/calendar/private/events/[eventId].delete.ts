import { mutatingPrivateApiCall } from '../../../../utils/privateApi'
import type { CalendarApiResponse } from '~~/server/types/api/calendar'

export default defineEventHandler(
  async (event): Promise<CalendarApiResponse> => {
    const eventId = getRouterParam(event, 'eventId')
    if (!eventId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid event id',
      })
    }

    return mutatingPrivateApiCall<CalendarApiResponse>(
      event,
      `/calendar/private/events/${eventId}`,
      {
        mutationKey: 'calendar:events:delete',
        method: 'DELETE',
      },
    )
  },
)
