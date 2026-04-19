import { cachedPrivateGet } from '~~/server/utils/privateApi'
import { getAdminResource } from '~~/server/utils/adminManagement'

export default defineEventHandler(async (event) => {
  const { endpointResource } = getAdminResource(event)

  try {
    return await cachedPrivateGet(event, `/api/v1/${endpointResource}/count`)
  } catch (error) {
    const statusCode = (error as { statusCode?: number } | null)?.statusCode

    if (statusCode !== 404) {
      throw error
    }

    const rows = await cachedPrivateGet<Record<string, unknown>[]>(
      event,
      `/api/v1/${endpointResource}`,
    )

    return { count: Array.isArray(rows) ? rows.length : 0 }
  }
})
