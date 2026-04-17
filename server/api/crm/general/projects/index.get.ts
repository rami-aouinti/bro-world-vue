import type { CrmProjectListItem, ApiListResponse } from '~~/server/types/api/crm-general'
import { cachedCrmGeneralGet } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<ApiListResponse<CrmProjectListItem>> => {
  return cachedCrmGeneralGet<ApiListResponse<CrmProjectListItem>>(event, 'projects', getQuery(event))
})
