import { mutatingPrivateApiCall } from '../../../../utils/privateApi'
import type {
  UpdateCalendarEventPayload,
  CalendarApiResponse,
} from '~~/server/types/api/calendar'

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

    return mutatingPrivateApiCall<CalendarApiResponse>(
      event,
      `/calendar/private/events/${eventId}`,
      {
        mutationKey: 'calendar:events:update',
        method: 'PATCH',
        body,
      },
    )
  },
)
