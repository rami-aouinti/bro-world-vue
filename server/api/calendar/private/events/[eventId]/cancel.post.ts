import { mutatingPrivateApiCall } from '../../../../../utils/privateApi'
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
      `/calendar/private/events/${eventId}/cancel`,
      {
        mutationKey: 'calendar:events:cancel',
        method: 'POST',
      },
    )
  },
)
