import type { CrmEmployeeItem } from '~~/server/types/api/crm-general'
import { cachedCrmGeneralGet } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmEmployeeItem> => {
  const employee = getRouterParam(event, 'employee')

  if (!employee) {
    throw createError({ statusCode: 400, statusMessage: 'Missing employee id' })
  }

  return cachedCrmGeneralGet<Record<string, unknown>>(event, `employees/${employee}`) as CrmEmployeeItem
})
