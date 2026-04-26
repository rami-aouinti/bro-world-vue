import type { CrmProjectListItem, ApiListResponse } from '~~/server/types/api/crm-general'
import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(async (event): Promise<ApiListResponse<CrmProjectListItem>> => {
  return fetchCrmGeneral<ApiListResponse<CrmProjectListItem>>(event, 'projects', { query: getQuery(event) as Record<string, string | number | boolean | undefined> })
})
