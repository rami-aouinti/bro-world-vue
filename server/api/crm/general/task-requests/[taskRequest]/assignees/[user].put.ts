import type { CrmIdResponse } from '~~/server/types/api/crm-general'
import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmIdResponse> => {
  const taskRequest = getRouterParam(event, 'taskRequest')
  const user = getRouterParam(event, 'user')

  if (!taskRequest || !user) {
    throw createError({ statusCode: 400, statusMessage: 'Missing task request id or user id' })
  }

  return mutateCrmGeneral<CrmIdResponse>(
    event,
    `task-requests/${taskRequest}/assignees/${user}`,
    {
      method: 'PUT',
    },
  )
})
