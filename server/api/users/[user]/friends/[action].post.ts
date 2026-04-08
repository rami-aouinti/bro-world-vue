import { callPrivateApi } from '../../../../utils/privateApi'
import type { UsersApiResponse } from '~~/server/types/api/users'

const allowedActions = new Set(['request', 'cancel', 'accept', 'reject'])

export default defineEventHandler(async (event): Promise<UsersApiResponse> => {
  const userId = getRouterParam(event, 'user')
  const action = getRouterParam(event, 'action')

  if (!userId || !action || !allowedActions.has(action)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid user or action',
    })
  }

  return callPrivateApi<UsersApiResponse>(
    event,
    `/users/${userId}/friends/${action}`,
    {
      method: 'POST',
    },
  )
})
