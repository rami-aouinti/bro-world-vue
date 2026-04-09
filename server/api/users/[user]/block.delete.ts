import { mutatingPrivateApiCall } from '../../../utils/privateApi'
import type { UsersApiResponse } from '~~/server/types/api/users'

export default defineEventHandler(async (event): Promise<UsersApiResponse> => {
  const userId = getRouterParam(event, 'user')

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid user id',
    })
  }

  return mutatingPrivateApiCall<UsersApiResponse>(
    event,
    `/users/${userId}/block`,
    {
      mutationKey: 'users:block:delete',
      method: 'DELETE',
    },
  )
})
