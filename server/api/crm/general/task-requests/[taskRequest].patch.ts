import type { CrmTaskRequestUpdatePayload, CrmIdResponse } from '~~/server/types/api/crm-general'
import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmIdResponse> => {
  const taskRequest = getRouterParam(event, 'taskRequest')

  if (!taskRequest) {
    throw createError({ statusCode: 400, statusMessage: 'Missing task request id' })
  }

  const body = await readBody<CrmTaskRequestUpdatePayload>(event)

  return mutateCrmGeneral<CrmIdResponse>(event, `task-requests/${taskRequest}`, {
    method: 'PATCH',
    body,
  })
})
