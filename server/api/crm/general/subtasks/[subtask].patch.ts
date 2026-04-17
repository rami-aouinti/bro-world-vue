import type { CrmSubtaskUpdatePayload, CrmIdResponse } from '~~/server/types/api/crm-general'
import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmIdResponse> => {
  const subtask = getRouterParam(event, 'subtask')

  if (!subtask) {
    throw createError({ statusCode: 400, statusMessage: 'Missing subtask id' })
  }

  const body = await readBody<CrmSubtaskUpdatePayload>(event)

  return mutateCrmGeneral<CrmIdResponse>(event, `subtasks/${subtask}`, {
    method: 'PATCH',
    body,
  })
})
