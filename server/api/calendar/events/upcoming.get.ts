import { callPrivateApi } from '../../../utils/privateApi'
import type { CalendarApiResponse } from '~~/server/types/api/calendar'

export default defineEventHandler(
  async (event): Promise<CalendarApiResponse> => {
    return callPrivateApi<CalendarApiResponse>(
      event,
      '/calendar/events/upcoming',
    )
  },
)
