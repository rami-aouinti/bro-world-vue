import type { CrmIdResponse } from '~~/server/types/api/crm-general'
import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event) => {
  const taskRequest = getRouterParam(event, 'taskRequest')

  if (!taskRequest) {
    throw createError({ statusCode: 400, statusMessage: 'Missing task request id' })
  }

  return mutateCrmGeneral<CrmIdResponse>(event, `task-requests/${taskRequest}/status`, {
    method: 'PATCH',
    body: await readBody<Record<string, unknown>>(event),
  })
})
