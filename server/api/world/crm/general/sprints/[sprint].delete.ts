import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  const sprintId = getRouterParam(event, 'sprint')

  if (!sprintId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing sprint id' })
  }

  return await fetchCrmGeneral(`sprints/${sprintId}`, {
    method: 'DELETE',
  })
})
