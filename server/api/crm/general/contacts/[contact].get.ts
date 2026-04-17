import type { CrmContactItem } from '~~/server/types/api/crm-general'
import { cachedCrmGeneralGet } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmContactItem> => {
  const contact = getRouterParam(event, 'contact')

  if (!contact) {
    throw createError({ statusCode: 400, statusMessage: 'Missing contact id' })
  }

  return cachedCrmGeneralGet<CrmContactItem>(event, `contacts/${contact}`)
})
