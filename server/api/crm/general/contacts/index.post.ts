import type { CrmContactCreatePayload, CrmIdResponse } from '~~/server/types/api/crm-general'
import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmIdResponse> => {
  const body = await readBody<CrmContactCreatePayload>(event)

  return mutateCrmGeneral<CrmIdResponse>(event, 'contacts', {
    method: 'POST',
    body,
  })
})
