import type {
  CrmTaskCreatePayload,
  CrmIdResponse,
} from '~~/server/types/api/crm-general'
import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmIdResponse> => {
  const body = await readBody<CrmTaskCreatePayload>(event)

  return mutateCrmGeneral<CrmIdResponse>(event, 'tasks', {
    method: 'POST',
    body,
  })
})
