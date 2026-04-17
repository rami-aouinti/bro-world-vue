import type { CrmSubtaskCreatePayload, CrmIdResponse } from '~~/server/types/api/crm-general'
import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmIdResponse> => {
  const task = getRouterParam(event, 'task')

  if (!task) {
    throw createError({ statusCode: 400, statusMessage: 'Missing task id' })
  }

  const body = await readBody<CrmSubtaskCreatePayload>(event)

  return mutateCrmGeneral<CrmIdResponse>(event, `tasks/${task}/subtasks`, {
    method: 'POST',
    body,
  })
})
