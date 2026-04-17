import type { CrmProjectUpdatePayload, CrmIdResponse } from '~~/server/types/api/crm-general'
import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmIdResponse> => {
  const project = getRouterParam(event, 'project')

  if (!project) {
    throw createError({ statusCode: 400, statusMessage: 'Missing project id' })
  }

  const body = await readBody<CrmProjectUpdatePayload>(event)

  return mutateCrmGeneral<CrmIdResponse>(event, `projects/${project}`, {
    method: 'PATCH',
    body,
  })
})
