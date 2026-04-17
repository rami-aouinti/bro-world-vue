import type { CrmBillingItem, ApiListResponse } from '~~/server/types/api/crm-general'
import { cachedCrmGeneralGet } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<ApiListResponse<CrmBillingItem>> => {
  return cachedCrmGeneralGet<ApiListResponse<CrmBillingItem>>(event, 'billings', getQuery(event))
})
