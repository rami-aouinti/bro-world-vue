import { callPrivateApi } from '../../../../../utils/privateApi'
import type { UsersApiResponse } from '~~/server/types/api/users'

export default defineEventHandler(async (event): Promise<UsersApiResponse> => {
  return callPrivateApi<UsersApiResponse>(
    event,
    '/users/me/friends/requests/sent',
  )
})
