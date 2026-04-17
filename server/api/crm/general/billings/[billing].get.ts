import type { CrmBillingItem } from '~~/server/types/api/crm-general'
import { cachedCrmGeneralGet } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmBillingItem> => {
  const billing = getRouterParam(event, 'billing')

  if (!billing) {
    throw createError({ statusCode: 400, statusMessage: 'Missing billing id' })
  }

  return cachedCrmGeneralGet<CrmBillingItem>(event, `billings/${billing}`)
})
