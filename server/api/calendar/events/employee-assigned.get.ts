import { getQuery } from 'h3'
import { cachedPrivateGet } from '../../../utils/privateApi'
import type { CalendarApiResponse } from '~~/server/types/api/calendar'

export default defineEventHandler(
  async (event): Promise<CalendarApiResponse> => {
    const query = getQuery(event)
    const applicationSlug = String(query.applicationSlug || '').trim()

    if (!applicationSlug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing applicationSlug',
      })
    }

    return cachedPrivateGet<CalendarApiResponse>(
      event,
      '/calendar/events/employee-assigned',
      {
        query: {
          applicationSlug,
        },
        cacheDomain: 'calendar',
      },
    )
  },
)
