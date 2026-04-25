import type { CrmProjectItem } from '~~/server/types/api/crm-general'
import { cachedCrmGeneralGet } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmProjectItem> => {
  const project = getRouterParam(event, 'project')

  if (!project) {
    throw createError({ statusCode: 400, statusMessage: 'Missing project id' })
  }

  return cachedCrmGeneralGet<CrmProjectItem>(event, `projects/${project}`)
})
