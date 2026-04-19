import { callPrivateApi, getSessionAuth } from '~~/server/utils/privateApi'
import { getAdminResource } from '~~/server/utils/adminManagement'
import { invalidateByPrefix, privateCachePrefix } from '~~/server/utils/apiCache'

export default defineEventHandler(async (event) => {
  const { endpointResource } = getAdminResource(event)
  const { username } = await getSessionAuth(event)
  const payload = await readBody<Record<string, unknown>>(event)

  const response = await callPrivateApi(event, `/api/v1/${endpointResource}`, {
    method: 'POST',
    body: payload,
  })

  await invalidateByPrefix(privateCachePrefix({ username, resourcePrefix: 'default' }))
  return response
})
