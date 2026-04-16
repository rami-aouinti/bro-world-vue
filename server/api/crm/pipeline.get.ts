import type { CrmPipelineApiResponse } from '../../types/api/crm'
import { getCached, privateCacheKey, setCached } from '../../utils/apiCache'
import { resolveCacheTtl } from '../../utils/apiCacheConfig'
import { getSessionUser, requireCrmPermission } from '../../utils/crmAccessControl'
import { getCrmPipelineSnapshot } from '../../utils/crmPipelineStore'

export default defineEventHandler(async (event): Promise<CrmPipelineApiResponse> => {
  await requireCrmPermission(event, 'crm.opportunities.read')
  const user = await getSessionUser(event)
  const username = user?.username?.trim()

  if (!username) {
    throw createError({ statusCode: 401, statusMessage: 'Missing username' })
  }

  const cacheKey = privateCacheKey(username, '/crm/pipeline')
  const cached = await getCached<CrmPipelineApiResponse>(cacheKey)

  if (cached) {
    return cached
  }

  const response = getCrmPipelineSnapshot()
  await setCached(cacheKey, response, resolveCacheTtl('default'))

  return response
})
