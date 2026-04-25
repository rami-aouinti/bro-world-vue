import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(async (event) => {
  const taskRequest = getRouterParam(event, 'taskRequest')

  if (!taskRequest) {
    throw createError({ statusCode: 400, statusMessage: 'Missing task request id' })
  }

  return fetchCrmGeneral(`task-requests/${taskRequest}/github/branches`, {
    query: getQuery(event) as Record<string, string | number | boolean | undefined>,
  })
})
