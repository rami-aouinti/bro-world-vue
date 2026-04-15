import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  const taskRequestId = getRouterParam(event, 'taskRequest')

  if (!taskRequestId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing taskRequest id' })
  }

  return await fetchCrmGeneral(`task-requests/${taskRequestId}`, {
    method: 'DELETE',
  })
})
