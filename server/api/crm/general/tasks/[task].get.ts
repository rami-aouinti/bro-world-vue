import type { CrmTaskItem } from '~~/server/types/api/crm-general'
import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(async (event): Promise<CrmTaskItem> => {
  const task = getRouterParam(event, 'task')

  if (!task) {
    throw createError({ statusCode: 400, statusMessage: 'Missing task id' })
  }

  return fetchCrmGeneral<CrmTaskItem>(`tasks/${task}`)
})
