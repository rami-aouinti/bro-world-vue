import { mutatingPrivateApiCall } from '../../../../../../utils/privateApi'
import type { MarkMessagesReadPayload } from '~~/server/types/api/chat'
import type { ChatApiResponse } from '~~/server/types/api/chat'

export default defineEventHandler(async (event): Promise<ChatApiResponse> => {
  const conversationId = getRouterParam(event, 'conversationId')
  if (!conversationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid conversation id',
    })
  }

  const body = await readBody<MarkMessagesReadPayload>(event)

  return mutatingPrivateApiCall<ChatApiResponse>(
    event,
    `/chat/private/conversations/${conversationId}/messages/read`,
    {
      mutationKey: 'chat:conversations:messages:read',
      method: 'POST',
      body,
    },
  )
})
