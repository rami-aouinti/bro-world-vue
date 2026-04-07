import { callPrivateApi } from '../../../../utils/privateApi'

const allowedActions = new Set(['request', 'cancel', 'accept', 'reject'])

export default defineEventHandler(async (event): Promise<unknown> => {
  const userId = getRouterParam(event, 'user')
  const action = getRouterParam(event, 'action')

  if (!userId || !action || !allowedActions.has(action)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid user or action',
    })
  }

  return callPrivateApi(event, `/users/${userId}/friends/${action}`, {
    method: 'POST',
  })
})
