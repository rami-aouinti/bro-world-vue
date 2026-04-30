import type {
  CrmContactUpdatePayload,
  CrmIdResponse,
} from '~~/server/types/api/crm-general'
import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmIdResponse> => {
  const contact = getRouterParam(event, 'contact')

  if (!contact) {
    throw createError({ statusCode: 400, statusMessage: 'Missing contact id' })
  }

  const body = await readBody<CrmContactUpdatePayload>(event)

  return mutateCrmGeneral<CrmIdResponse>(event, `contacts/${contact}`, {
    method: 'PATCH',
    body,
  })
})
