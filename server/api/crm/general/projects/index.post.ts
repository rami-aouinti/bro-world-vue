import type {
  CrmProjectCreatePayload,
  CrmIdResponse,
} from '~~/server/types/api/crm-general'
import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmIdResponse> => {
  const body = await readBody<CrmProjectCreatePayload>(event)

  return mutateCrmGeneral<CrmIdResponse>(event, 'projects', {
    method: 'POST',
    body,
  })
})
