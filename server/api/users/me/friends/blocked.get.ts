import { cachedPrivateGet } from '../../../../utils/privateApi'
import type { UsersApiResponse } from '~~/server/types/api/users'

export default defineEventHandler(async (event): Promise<UsersApiResponse> => {
  return cachedPrivateGet<UsersApiResponse>(event, '/users/me/friends/blocked', {
    cacheDomain: 'users',
  })
})
