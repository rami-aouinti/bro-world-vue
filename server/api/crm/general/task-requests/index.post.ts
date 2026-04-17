import type { CrmTaskRequestCreatePayload, CrmIdResponse } from '~~/server/types/api/crm-general'
import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmIdResponse> => {
  const body = await readBody<CrmTaskRequestCreatePayload>(event)

  return mutateCrmGeneral<CrmIdResponse>(event, 'task-requests', {
    method: 'POST',
    body,
  })
})
