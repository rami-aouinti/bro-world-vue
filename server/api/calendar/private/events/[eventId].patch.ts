import { callPrivateApi } from '../../../../utils/privateApi'
import type { UpdateCalendarEventPayload } from '~~/server/types/api/calendar'
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

    const body = await readBody<UpdateCalendarEventPayload>(event)

    return callPrivateApi<CalendarApiResponse>(
      event,
      `/calendar/private/events/${eventId}`,
      {
        method: 'PATCH',
        body,
      },
    )
  },
)
