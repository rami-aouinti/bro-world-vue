import type { CrmSprintItem } from '~~/server/types/api/crm-general'
import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(async (event): Promise<CrmSprintItem> => {
  const sprint = getRouterParam(event, 'sprint')

  if (!sprint) {
    throw createError({ statusCode: 400, statusMessage: 'Missing sprint id' })
  }

  return fetchCrmGeneral<CrmSprintItem>(`sprints/${sprint}`)
})
