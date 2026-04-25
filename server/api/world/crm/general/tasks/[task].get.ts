import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  const taskId = getRouterParam(event, 'task')

  if (!taskId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing task id' })
  }

  return await fetchCrmGeneral(event, `tasks/${taskId}`)
})
