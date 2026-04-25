import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  const projectId = getRouterParam(event, 'project')

  if (!projectId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing project id' })
  }

  const body = await readBody<Record<string, unknown>>(event)

  return await fetchCrmGeneral(event, `projects/${projectId}`, {
    method: 'PATCH',
    body,
  })
})
