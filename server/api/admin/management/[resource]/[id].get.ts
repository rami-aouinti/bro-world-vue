import { cachedPrivateGet } from '~~/server/utils/privateApi'
import { getAdminResource } from '~~/server/utils/adminManagement'

export default defineEventHandler(async (event) => {
  const { endpointResource } = getAdminResource(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing id parameter',
    })
  }

  return cachedPrivateGet(event, `/api/v1/${endpointResource}/${id}`)
})
