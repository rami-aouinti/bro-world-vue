import { callPrivateApi } from '../../utils/privateApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid story id',
    })
  }

  return callPrivateApi(event, `/api/v1/private/stories/${id}`, {
    method: 'DELETE',
  })
})
