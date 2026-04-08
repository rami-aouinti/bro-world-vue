import { callPrivateApi } from '../../../utils/privateApi'
import type { UsersApiResponse } from '~~/server/types/api/users'

export default defineEventHandler(async (event): Promise<UsersApiResponse> => {
  const userId = getRouterParam(event, 'user')

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid user id',
    })
  }

  return callPrivateApi<UsersApiResponse>(event, `/users/${userId}/block`, {
    method: 'DELETE',
  })
})
