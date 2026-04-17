import type { CrmContactItem, ApiListResponse } from '~~/server/types/api/crm-general'
import { cachedCrmGeneralGet } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<ApiListResponse<CrmContactItem>> => {
  return cachedCrmGeneralGet<ApiListResponse<CrmContactItem>>(event, 'contacts', getQuery(event))
})
