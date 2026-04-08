import { mutatingPrivateApiCall } from '../../../../utils/privateApi'
import type { UpdateConversationPayload } from '~~/server/types/api/chat'
import type { ChatApiResponse } from '~~/server/types/api/chat'

export default defineEventHandler(async (event): Promise<ChatApiResponse> => {
  const conversationId = getRouterParam(event, 'conversationId')
  if (!conversationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid conversation id',
    })
  }

  const body = await readBody<UpdateConversationPayload>(event)

  return mutatingPrivateApiCall<ChatApiResponse>(
    event,
    `/chat/private/conversations/${conversationId}`,
    {
      mutationKey: 'chat:conversations:update',
      method: 'PATCH',
      body,
    },
  )
})
