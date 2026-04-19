import { cachedPrivateGet } from '~~/server/utils/privateApi'
import { getAdminResource } from '~~/server/utils/adminManagement'

export default defineEventHandler(async (event) => {
  const { endpointResource } = getAdminResource(event)
  return cachedPrivateGet(event, `/api/v1/${endpointResource}/count`)
})
