import type {
  CrmBillingUpdatePayload,
  CrmIdResponse,
} from '~~/server/types/api/crm-general'
import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmIdResponse> => {
  const billing = getRouterParam(event, 'billing')

  if (!billing) {
    throw createError({ statusCode: 400, statusMessage: 'Missing billing id' })
  }

  const body = await readBody<CrmBillingUpdatePayload>(event)

  return mutateCrmGeneral<CrmIdResponse>(event, `billings/${billing}`, {
    method: 'PATCH',
    body,
  })
})
