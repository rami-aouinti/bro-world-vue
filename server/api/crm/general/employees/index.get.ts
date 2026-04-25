import type { ApiListResponse, CrmEmployeeItem } from '~~/server/types/api/crm-general'
import { cachedCrmGeneralGet } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<ApiListResponse<CrmEmployeeItem>> => {
  return cachedCrmGeneralGet<Record<string, unknown>>(event, 'employees', getQuery(event)) as ApiListResponse<CrmEmployeeItem>
})
