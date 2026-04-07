import { callPrivateApi } from '../../../../utils/privateApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  const eventId = getRouterParam(event, 'eventId')
  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid event id',
    })
  }

  const body = await readBody(event)

  return callPrivateApi(event, `/calendar/private/events/${eventId}`, {
    method: 'PATCH',
    body,
  })
})
