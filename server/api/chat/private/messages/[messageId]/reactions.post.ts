import { callPrivateApi } from '../../../../../utils/privateApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  const messageId = getRouterParam(event, 'messageId')
  if (!messageId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid message id',
    })
  }

  const body = await readBody(event)

  return callPrivateApi(
    event,
    `/chat/private/messages/${messageId}/reactions`,
    {
      method: 'POST',
      body,
    },
  )
})
