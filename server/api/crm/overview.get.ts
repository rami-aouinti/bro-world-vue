import type {
  CrmOverviewApiResponse,
  CrmOverviewQuery,
} from '../../types/api/crm'
import { getCached, privateCacheKey, setCached } from '../../utils/apiCache'
import { resolveCacheTtl } from '../../utils/apiCacheConfig'
import { getCrmOverview } from '../../utils/crmPipelineStore'
import {
  getSessionUser,
  requireCrmPermission,
} from '../../utils/crmAccessControl'

export default defineEventHandler(
  async (event): Promise<CrmOverviewApiResponse> => {
    await requireCrmPermission(event, 'crm.opportunities.read')
    const user = await getSessionUser(event)
    const username = user?.username?.trim()

    if (!username) {
      throw createError({ statusCode: 401, statusMessage: 'Missing username' })
    }

    const query = getQuery(event) as CrmOverviewQuery
    const cacheKey = privateCacheKey(username, '/crm/overview', query)
    const cached = await getCached<CrmOverviewApiResponse>(cacheKey)

    if (cached) {
      return cached
    }

    const response = getCrmOverview(query)
    await setCached(cacheKey, response, resolveCacheTtl('default'))

    return response
  },
)
