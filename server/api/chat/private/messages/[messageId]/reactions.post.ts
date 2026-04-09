import { mutatingPrivateApiCall } from '../../../../../utils/privateApi'
import type {
  ChatReactionPayload,
  ChatApiResponse,
} from '~~/server/types/api/chat'

export default defineEventHandler(async (event): Promise<ChatApiResponse> => {
  const messageId = getRouterParam(event, 'messageId')
  if (!messageId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid message id',
    })
  }

  const body = await readBody<ChatReactionPayload>(event)

  return mutatingPrivateApiCall<ChatApiResponse>(
    event,
    `/chat/private/messages/${messageId}/reactions`,
    {
      mutationKey: 'chat:messages:reactions:create',
      method: 'POST',
      body,
    },
  )
})
