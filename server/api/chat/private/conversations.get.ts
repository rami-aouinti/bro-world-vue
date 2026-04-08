import { cachedPrivateGet } from '../../../utils/privateApi'
import type { ChatApiResponse } from '~~/server/types/api/chat'

export default defineEventHandler(async (event): Promise<ChatApiResponse> => {
  return cachedPrivateGet<ChatApiResponse>(event, '/chat/private/conversations', {
    cacheDomain: 'chat',
  })
})
