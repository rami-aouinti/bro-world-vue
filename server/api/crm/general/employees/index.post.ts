import type { CrmEmployeeCreatePayload, CrmIdResponse } from '~~/server/types/api/crm-general'
import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmIdResponse> => {
  const body = await readBody<CrmEmployeeCreatePayload>(event)

  return mutateCrmGeneral<Record<string, unknown>>(event, 'employees', {
    method: 'POST',
    body,
  })
})
