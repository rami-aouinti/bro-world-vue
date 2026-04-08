import { callPrivateApi } from '../../../utils/privateApi'
import type { ChatApiResponse } from '~~/server/types/api/chat'

export default defineEventHandler(async (event): Promise<ChatApiResponse> => {
  return callPrivateApi<ChatApiResponse>(event, '/chat/private/conversations')
})
