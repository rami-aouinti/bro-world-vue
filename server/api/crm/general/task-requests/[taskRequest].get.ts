import type { CrmTaskRequestItem } from '~~/server/types/api/crm-general'
import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(async (event): Promise<CrmTaskRequestItem> => {
  const taskRequest = getRouterParam(event, 'taskRequest')

  if (!taskRequest) {
    throw createError({ statusCode: 400, statusMessage: 'Missing task request id' })
  }

  return fetchCrmGeneral<CrmTaskRequestItem>(`task-requests/${taskRequest}`)
})
