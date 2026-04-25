import type { CrmSprintItem } from '~~/server/types/api/crm-general'
import { cachedCrmGeneralGet } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmSprintItem> => {
  const sprint = getRouterParam(event, 'sprint')

  if (!sprint) {
    throw createError({ statusCode: 400, statusMessage: 'Missing sprint id' })
  }

  return cachedCrmGeneralGet<CrmSprintItem>(event, `sprints/${sprint}`)
})
