import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  const taskRequestId = getRouterParam(event, 'taskRequest')

  if (!taskRequestId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing taskRequest id',
    })
  }

  const body = await readBody<Record<string, unknown>>(event)

  return await fetchCrmGeneral(event, `task-requests/${taskRequestId}`, {
    method: 'PATCH',
    body,
  })
})
