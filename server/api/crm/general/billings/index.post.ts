import type {
  CrmBillingCreatePayload,
  CrmIdResponse,
} from '~~/server/types/api/crm-general'
import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmIdResponse> => {
  const body = await readBody<CrmBillingCreatePayload>(event)

  return mutateCrmGeneral<CrmIdResponse>(event, 'billings', {
    method: 'POST',
    body,
  })
})
