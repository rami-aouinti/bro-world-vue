import type { CrmOverviewApiResponse, CrmOverviewQuery } from '../../types/api/crm'
import { getCrmOverview } from '../../utils/crmPipelineStore'
import { requireCrmPermission } from '../../utils/crmAccessControl'

export default defineEventHandler(
  async (event): Promise<CrmOverviewApiResponse> => {
    await requireCrmPermission(event, 'crm.opportunities.read')
    const query = getQuery(event) as CrmOverviewQuery
    return getCrmOverview(query)
  },
)
