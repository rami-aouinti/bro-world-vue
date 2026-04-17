import type { CrmTaskItem, ApiListResponse } from '~~/server/types/api/crm-general'
import { cachedCrmGeneralGet } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<ApiListResponse<CrmTaskItem>> => {
  return cachedCrmGeneralGet<ApiListResponse<CrmTaskItem>>(event, 'tasks', getQuery(event))
})
