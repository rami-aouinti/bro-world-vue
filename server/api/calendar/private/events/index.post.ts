import { callPrivateApi } from '../../../../utils/privateApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  const body = await readBody(event)

  return callPrivateApi(event, '/calendar/private/events', {
    method: 'POST',
    body,
  })
})
