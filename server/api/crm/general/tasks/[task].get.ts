import type { CrmTaskItem } from '~~/server/types/api/crm-general'
import { cachedCrmGeneralGet } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmTaskItem> => {
  const task = getRouterParam(event, 'task')

  if (!task) {
    throw createError({ statusCode: 400, statusMessage: 'Missing task id' })
  }

  return cachedCrmGeneralGet<CrmTaskItem>(event, `tasks/${task}`)
})
