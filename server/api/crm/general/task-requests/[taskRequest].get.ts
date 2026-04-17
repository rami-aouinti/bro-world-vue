import type { CrmTaskRequestItem } from '~~/server/types/api/crm-general'
import { cachedCrmGeneralGet } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmTaskRequestItem> => {
  const taskRequest = getRouterParam(event, 'taskRequest')

  if (!taskRequest) {
    throw createError({ statusCode: 400, statusMessage: 'Missing task request id' })
  }

  return cachedCrmGeneralGet<CrmTaskRequestItem>(event, `task-requests/${taskRequest}`)
})
