import { cachedPrivateGet } from '../../../../utils/privateApi'
import type { CalendarApiResponse } from '~~/server/types/api/calendar'

export default defineEventHandler(
  async (event): Promise<CalendarApiResponse> => {
    return cachedPrivateGet<CalendarApiResponse>(
      event,
      '/calendar/private/events',
      {
        cacheDomain: 'calendar',
      },
    )
  },
)
