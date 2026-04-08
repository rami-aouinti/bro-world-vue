import { mutatingPrivateApiCall } from '../../../../utils/privateApi'
import type { ChatApiResponse } from '~~/server/types/api/chat'

export default defineEventHandler(async (event): Promise<ChatApiResponse> => {
  const reactionId = getRouterParam(event, 'reactionId')
  if (!reactionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid reaction id',
    })
  }

  return mutatingPrivateApiCall<ChatApiResponse>(
    event,
    `/chat/private/reactions/${reactionId}`,
    {
      mutationKey: 'chat:reactions:delete',
      method: 'DELETE',
    },
  )
})
