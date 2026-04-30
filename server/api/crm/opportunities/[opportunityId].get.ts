import type { CrmOpportunityDetailApiResponse } from '../../../types/api/crm'
import { getCached, privateCacheKey, setCached } from '../../../utils/apiCache'
import { resolveCacheTtl } from '../../../utils/apiCacheConfig'
import {
  getSessionUser,
  requireCrmPermission,
} from '../../../utils/crmAccessControl'
import { getCrmOpportunityDetail } from '../../../utils/crmPipelineStore'

export default defineEventHandler(
  async (event): Promise<CrmOpportunityDetailApiResponse> => {
    await requireCrmPermission(event, 'crm.opportunities.read')
    const user = await getSessionUser(event)
    const username = user?.username?.trim()

    if (!username) {
      throw createError({ statusCode: 401, statusMessage: 'Missing username' })
    }

    const opportunityId = getRouterParam(event, 'opportunityId')

    if (!opportunityId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing opportunity id',
      })
    }

    const cacheKey = privateCacheKey(
      username,
      `/crm/opportunities/${opportunityId}`,
    )
    const cached = await getCached<CrmOpportunityDetailApiResponse>(cacheKey)

    if (cached) {
      return cached
    }

    const detail = getCrmOpportunityDetail(opportunityId)

    if (!detail) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Opportunity not found',
      })
    }

    await setCached(cacheKey, detail, resolveCacheTtl('default'))

    return detail
  },
)
