import { mutatingPrivateApiCall } from '../../../../utils/privateApi'
import type { ChatApiResponse } from '~~/server/types/api/chat'

export default defineEventHandler(async (event): Promise<ChatApiResponse> => {
  const messageId = getRouterParam(event, 'messageId')
  if (!messageId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid message id',
    })
  }

  return mutatingPrivateApiCall<ChatApiResponse>(
    event,
    `/chat/private/messages/${messageId}`,
    {
      mutationKey: 'chat:messages:delete',
      method: 'DELETE',
    },
  )
})
