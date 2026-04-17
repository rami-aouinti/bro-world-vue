import { cachedPrivateGet } from '../../../../utils/privateApi'
import type { CalendarApiResponse } from '~~/server/types/api/calendar'

export default defineEventHandler(
  async (event): Promise<CalendarApiResponse> => {
    const response = await cachedPrivateGet<CalendarApiResponse | unknown[]>(
      event,
      '/api/calendar/events/upcoming',
      {
        cacheDomain: 'calendar',
      },
    )

    if (Array.isArray(response)) {
      return {
        items: response,
      }
    }

    return response
  },
)
