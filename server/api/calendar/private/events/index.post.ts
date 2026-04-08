import { callPrivateApi } from '../../../../utils/privateApi'
import type { CreateCalendarEventPayload } from '~~/server/types/api/calendar'
import type { CalendarApiResponse } from '~~/server/types/api/calendar'

export default defineEventHandler(
  async (event): Promise<CalendarApiResponse> => {
    const body = await readBody<CreateCalendarEventPayload>(event)

    return callPrivateApi<CalendarApiResponse>(
      event,
      '/calendar/private/events',
      {
        method: 'POST',
        body,
      },
    )
  },
)
