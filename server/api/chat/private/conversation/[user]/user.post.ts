import { mutatingPrivateApiCall } from '../../../../../utils/privateApi'
import type { ChatApiResponse } from '~~/server/types/api/chat'

export default defineEventHandler(async (event): Promise<ChatApiResponse> => {
  const userId = getRouterParam(event, 'user')

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid user id',
    })
  }

  return mutatingPrivateApiCall<ChatApiResponse>(
    event,
    `/chat/private/conversation/${userId}/user`,
    {
      mutationKey: 'chat:conversations:create',
      method: 'POST',
    },
  )
})
