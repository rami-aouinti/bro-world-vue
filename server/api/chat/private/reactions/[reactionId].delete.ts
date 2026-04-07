import { callPrivateApi } from '../../../../utils/privateApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  const reactionId = getRouterParam(event, 'reactionId')
  if (!reactionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid reaction id',
    })
  }

  return callPrivateApi(event, `/chat/private/reactions/${reactionId}`, {
    method: 'DELETE',
  })
})
