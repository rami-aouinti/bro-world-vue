import { cachedPrivateGet } from '../../utils/privateApi'
import type { UsersApiResponse } from '../../types/api/users'

export default defineEventHandler((event) => {
  return cachedPrivateGet<UsersApiResponse>(event, '/users/me', {
    cacheDomain: 'users',
  })
})
