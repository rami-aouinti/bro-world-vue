import type { CrmDashboardResponse } from '~~/server/types/api/crm-general'
import { cachedCrmGeneralGet } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(
  async (event): Promise<CrmDashboardResponse> => {
    return cachedCrmGeneralGet<CrmDashboardResponse>(event, 'dashboard')
  },
)
