import type { CrmPipelineApiResponse } from '../../types/api/crm'
import { getCrmPipelineSnapshot } from '../../utils/crmPipelineStore'
import { requireCrmPermission } from '../../utils/crmAccessControl'

export default defineEventHandler(async (event): Promise<CrmPipelineApiResponse> => {
  await requireCrmPermission(event, 'crm.opportunities.read')
  return getCrmPipelineSnapshot()
})
