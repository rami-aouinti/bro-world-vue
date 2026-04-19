import { cachedPrivateGet } from '~~/server/utils/privateApi'
import { getAdminResource, sanitizeQuery } from '~~/server/utils/adminManagement'

export default defineEventHandler(async (event) => {
  const { endpointResource } = getAdminResource(event)
  const query = sanitizeQuery(getQuery(event))

  return cachedPrivateGet(event, `/api/v1/${endpointResource}`, { query })
})
