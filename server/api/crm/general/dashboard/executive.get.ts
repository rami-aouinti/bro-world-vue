import type { CrmDashboardExecutiveResponse } from '~~/server/types/api/crm-general'
import { cachedCrmGeneralGet } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(
  async (event): Promise<CrmDashboardExecutiveResponse> => {
    return cachedCrmGeneralGet<Record<string, unknown>>(
      event,
      'dashboard/executive',
    ) as CrmDashboardExecutiveResponse
  },
)
