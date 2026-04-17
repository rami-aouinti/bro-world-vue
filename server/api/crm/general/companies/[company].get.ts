import type { CrmCompanyItem } from '~~/server/types/api/crm-general'
import { cachedCrmGeneralGet } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmCompanyItem> => {
  const company = getRouterParam(event, 'company')

  if (!company) {
    throw createError({ statusCode: 400, statusMessage: 'Missing company id' })
  }

  return cachedCrmGeneralGet<CrmCompanyItem>(event, `companies/${company}`)
})
