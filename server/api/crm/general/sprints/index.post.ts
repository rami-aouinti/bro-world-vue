import type {
  CrmSprintCreatePayload,
  CrmIdResponse,
} from '~~/server/types/api/crm-general'
import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmIdResponse> => {
  const body = await readBody<CrmSprintCreatePayload>(event)

  return mutateCrmGeneral<CrmIdResponse>(event, 'sprints', {
    method: 'POST',
    body,
  })
})
