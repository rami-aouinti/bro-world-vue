import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  const sprintId = getRouterParam(event, 'sprint')

  if (!sprintId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing sprint id' })
  }

  const body = await readBody<Record<string, unknown>>(event)

  return await fetchCrmGeneral(event, `sprints/${sprintId}`, {
    method: 'PATCH',
    body,
  })
})
