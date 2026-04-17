import type { CrmCompanyUpdatePayload, CrmIdResponse } from '~~/server/types/api/crm-general'
import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmIdResponse> => {
  const company = getRouterParam(event, 'company')

  if (!company) {
    throw createError({ statusCode: 400, statusMessage: 'Missing company id' })
  }

  const body = await readBody<CrmCompanyUpdatePayload>(event)

  return mutateCrmGeneral<CrmIdResponse>(event, `companies/${company}`, {
    method: 'PATCH',
    body,
  })
})
