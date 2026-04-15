import type { CrmPipelineApiResponse } from '../../types/api/crm'
import { getCrmPipelineSnapshot } from '../../utils/crmPipelineStore'

export default defineEventHandler(async (): Promise<CrmPipelineApiResponse> => {
  return getCrmPipelineSnapshot()
})
