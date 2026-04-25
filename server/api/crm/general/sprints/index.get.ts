import type { CrmSprintItem, ApiListResponse } from '~~/server/types/api/crm-general'
import { cachedCrmGeneralGet } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<ApiListResponse<CrmSprintItem>> => {
  return cachedCrmGeneralGet<ApiListResponse<CrmSprintItem>>(event, 'sprints', getQuery(event) as Record<string, string | number | boolean | undefined>)
})
