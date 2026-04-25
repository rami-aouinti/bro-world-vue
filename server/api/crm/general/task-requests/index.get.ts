import type { CrmTaskRequestItem, ApiListResponse } from '~~/server/types/api/crm-general'
import { cachedCrmGeneralGet } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<ApiListResponse<CrmTaskRequestItem>> => {
  return cachedCrmGeneralGet<ApiListResponse<CrmTaskRequestItem>>(event, 'task-requests', getQuery(event) as Record<string, string | number | boolean | undefined>)
})
