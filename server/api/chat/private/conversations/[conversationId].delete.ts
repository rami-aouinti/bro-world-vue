import { callPrivateApi } from '../../../../utils/privateApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  const conversationId = getRouterParam(event, 'conversationId')
  if (!conversationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid conversation id',
    })
  }

  return callPrivateApi(event, `/chat/private/conversations/${conversationId}`, {
    method: 'DELETE',
  })
})
