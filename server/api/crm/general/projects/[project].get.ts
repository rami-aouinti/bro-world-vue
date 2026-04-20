import type { CrmProjectItem } from '~~/server/types/api/crm-general'
import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(async (event): Promise<CrmProjectItem> => {
  const project = getRouterParam(event, 'project')

  if (!project) {
    throw createError({ statusCode: 400, statusMessage: 'Missing project id' })
  }

  return fetchCrmGeneral<CrmProjectItem>(`projects/${project}`)
})
