import type {
  CrmEmployeeUpdatePayload,
  CrmIdResponse,
} from '~~/server/types/api/crm-general'
import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmIdResponse> => {
  const employee = getRouterParam(event, 'employee')

  if (!employee) {
    throw createError({ statusCode: 400, statusMessage: 'Missing employee id' })
  }

  const body = await readBody<CrmEmployeeUpdatePayload>(event)

  return mutateCrmGeneral<Record<string, unknown>>(
    event,
    `employees/${employee}`,
    {
      method: 'PATCH',
      body,
    },
  )
})
