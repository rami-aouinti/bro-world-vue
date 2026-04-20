import type { CrmTaskRequestItem, ApiListResponse } from '~~/server/types/api/crm-general'
import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(async (event): Promise<ApiListResponse<CrmTaskRequestItem>> => {
  return fetchCrmGeneral<ApiListResponse<CrmTaskRequestItem>>('task-requests', { query: getQuery(event) as Record<string, string | number | boolean | undefined> })
})
