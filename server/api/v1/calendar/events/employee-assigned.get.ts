import { getQuery, readBody } from 'h3'
import type { CalendarApiResponse } from '~~/server/types/api/calendar'
import { callPrivateApi } from '../../../../utils/privateApi'

type EmployeeAssignedEventsPayload = {
  applicationSlug?: string
}

export default defineEventHandler(
  async (event): Promise<CalendarApiResponse> => {
    const payload = await readBody<EmployeeAssignedEventsPayload>(event).catch(
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
      '/api/v1/calendar/events/employee-assigned',
      {
        method: 'GET',
        body: {
          applicationSlug,
        },
      },
    )
  },
)
