import { cachedPrivateGet } from '../../../../utils/privateApi'
import type { ChatApiResponse } from '~~/server/types/api/chat'

export default defineEventHandler(async (event): Promise<ChatApiResponse> => {
  const conversationId = getRouterParam(event, 'conversationId')
  if (!conversationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid conversation id',
    })
  }

  return cachedPrivateGet<ChatApiResponse>(
    event,
    `/chat/private/conversations/${conversationId}`,
    {
      cacheDomain: 'chat',
    },
  )
})
