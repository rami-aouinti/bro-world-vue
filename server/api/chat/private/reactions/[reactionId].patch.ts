import { mutatingPrivateApiCall } from '../../../../utils/privateApi'
import type {
  ChatReactionPayload,
  ChatApiResponse,
} from '~~/server/types/api/chat'

export default defineEventHandler(async (event): Promise<ChatApiResponse> => {
  const reactionId = getRouterParam(event, 'reactionId')
  if (!reactionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid reaction id',
    })
  }

  const body = await readBody<ChatReactionPayload>(event)

  return mutatingPrivateApiCall<ChatApiResponse>(
    event,
    `/chat/private/reactions/${reactionId}`,
    {
      mutationKey: 'chat:reactions:update',
      method: 'PATCH',
      body,
    },
  )
})
