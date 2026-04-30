import type { CrmIdResponse } from '~~/server/types/api/crm-general'
import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmIdResponse> => {
  const employee = getRouterParam(event, 'employee')

  if (!employee) {
    throw createError({ statusCode: 400, statusMessage: 'Missing employee id' })
  }

  return mutateCrmGeneral<Record<string, unknown>>(
    event,
    `employees/${employee}`,
    {
      method: 'DELETE',
    },
  )
})
