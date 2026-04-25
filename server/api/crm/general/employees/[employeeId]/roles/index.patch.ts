import type { CrmIdResponse } from '~~/server/types/api/crm-general'
import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmIdResponse> => {
  const employeeId = getRouterParam(event, 'employeeId')

  if (!employeeId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing employee id' })
  }

  const body = await readBody<Record<string, unknown>>(event)

  return mutateCrmGeneral<Record<string, unknown>>(event, `employees/${employeeId}/roles`, {
    method: 'PATCH',
    body,
  })
})
