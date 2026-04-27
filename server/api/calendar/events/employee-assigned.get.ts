import { getQuery, readBody } from 'h3'
import { callPrivateApi } from '../../../utils/privateApi'
import type { CalendarApiResponse } from '~~/server/types/api/calendar'

export default defineEventHandler(
  async (event): Promise<CalendarApiResponse> => {
    const payload = await readBody<{ applicationSlug?: string }>(event).catch(
      () => ({}),
    )
    const query = getQuery(event)
    const applicationSlug = String(
      payload?.applicationSlug || query.applicationSlug || '',
    ).trim()

    if (!applicationSlug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing applicationSlug',
      })
    }

    return callPrivateApi<CalendarApiResponse>(
      event,
      '/calendar/events/employee-assigned',
      {
        method: 'GET',
        body: {
          applicationSlug,
        },
      },
    )
  },
)
