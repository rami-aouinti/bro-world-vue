import type {
  CrmCompanyCreatePayload,
  CrmIdResponse,
} from '~~/server/types/api/crm-general'
import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmIdResponse> => {
  const body = await readBody<CrmCompanyCreatePayload>(event)

  return mutateCrmGeneral<CrmIdResponse>(event, 'companies', {
    method: 'POST',
    body,
  })
})
