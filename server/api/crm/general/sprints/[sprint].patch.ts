import type {
  CrmSprintUpdatePayload,
  CrmIdResponse,
} from '~~/server/types/api/crm-general'
import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<CrmIdResponse> => {
  const sprint = getRouterParam(event, 'sprint')

  if (!sprint) {
    throw createError({ statusCode: 400, statusMessage: 'Missing sprint id' })
  }

  const body = await readBody<CrmSprintUpdatePayload>(event)

  return mutateCrmGeneral<CrmIdResponse>(event, `sprints/${sprint}`, {
    method: 'PATCH',
    body,
  })
})
