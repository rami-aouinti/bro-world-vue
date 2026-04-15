import type { CrmOpportunityDetailApiResponse } from '../../../types/api/crm'
import { getCrmOpportunityDetail } from '../../../utils/crmPipelineStore'
import { requireCrmPermission } from '../../../utils/crmAccessControl'

export default defineEventHandler(
  async (event): Promise<CrmOpportunityDetailApiResponse> => {
    await requireCrmPermission(event, 'crm.opportunities.read')

    const opportunityId = getRouterParam(event, 'opportunityId')

    if (!opportunityId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing opportunity id' })
    }

    const detail = getCrmOpportunityDetail(opportunityId)

    if (!detail) {
      throw createError({ statusCode: 404, statusMessage: 'Opportunity not found' })
    }

    return detail
  },
)
