import { callPrivateApi } from '../../../../utils/privateApi'
import type { ChatReactionPayload } from '~~/server/types/api/chat'
import type { ChatApiResponse } from '~~/server/types/api/chat'

export default defineEventHandler(async (event): Promise<ChatApiResponse> => {
  const reactionId = getRouterParam(event, 'reactionId')
  if (!reactionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid reaction id',
    })
  }

  const body = await readBody<ChatReactionPayload>(event)

  return callPrivateApi<ChatApiResponse>(
    event,
    `/chat/private/reactions/${reactionId}`,
    {
      method: 'PATCH',
      body,
    },
  )
})
