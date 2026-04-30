import { callPrivateApi, getSessionAuth } from '~~/server/utils/privateApi'
import { getAdminResource } from '~~/server/utils/adminManagement'
import {
  invalidateByPrefix,
  privateCachePrefix,
} from '~~/server/utils/apiCache'

export default defineEventHandler(async (event) => {
  const { endpointResource } = getAdminResource(event)
  const { username } = await getSessionAuth(event)
  const id = getRouterParam(event, 'id')
  const payload = await readBody<Record<string, unknown>>(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing id parameter',
    })
  }

  const response = await callPrivateApi(
    event,
    `/api/v1/${endpointResource}/${id}`,
    {
      method: 'PATCH',
      body: payload,
    },
  )

  await invalidateByPrefix(
    privateCachePrefix({ username, resourcePrefix: 'default' }),
  )
  return response
})
