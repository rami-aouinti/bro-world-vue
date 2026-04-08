import { callPrivateApi } from '../../../../../utils/privateApi'
import type { ChatReactionPayload } from '~~/server/types/api/chat'
import type { ChatApiResponse } from '~~/server/types/api/chat'

export default defineEventHandler(async (event): Promise<ChatApiResponse> => {
  const messageId = getRouterParam(event, 'messageId')
  if (!messageId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid message id',
    })
  }

  const body = await readBody<ChatReactionPayload>(event)

  return callPrivateApi<ChatApiResponse>(
    event,
    `/chat/private/messages/${messageId}/reactions`,
    {
      method: 'POST',
      body,
    },
  )
})
