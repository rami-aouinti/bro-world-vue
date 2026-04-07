import { callPrivateApi } from '../../../utils/privateApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  const userId = getRouterParam(event, 'user')

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid user id',
    })
  }

  return callPrivateApi(event, `/users/${userId}/block`, {
    method: 'DELETE',
  })
})
