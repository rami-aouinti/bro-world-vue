import { mutatingPrivateApiCall } from '../../../../utils/privateApi'
import type {
  CreateCalendarEventPayload,
  CalendarApiResponse,
} from '~~/server/types/api/calendar'

export default defineEventHandler(
  async (event): Promise<CalendarApiResponse> => {
    const body = await readBody<CreateCalendarEventPayload>(event)

    return mutatingPrivateApiCall<CalendarApiResponse>(
      event,
      '/calendar/private/events',
      {
        mutationKey: 'calendar:events:create',
        method: 'POST',
        body,
      },
    )
  },
)
