import { mutatingPrivateApiCall } from '../../../../../utils/privateApi'
import type {
  SendMessagePayload,
  ChatApiResponse,
} from '~~/server/types/api/chat'

export default defineEventHandler(async (event): Promise<ChatApiResponse> => {
  const conversationId = getRouterParam(event, 'conversationId')
  if (!conversationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid conversation id',
    })
  }

  const body = await readBody<SendMessagePayload>(event)

  return mutatingPrivateApiCall<ChatApiResponse>(
    event,
    `/chat/private/conversations/${conversationId}/messages`,
    {
      mutationKey: 'chat:conversations:messages:create',
      method: 'POST',
      body,
    },
  )
})
