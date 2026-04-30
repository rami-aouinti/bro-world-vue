import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<null> => {
  const taskRequest = getRouterParam(event, 'taskRequest')

  if (!taskRequest) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing task request id',
    })
  }

  await mutateCrmGeneral(event, `task-requests/${taskRequest}`, {
    method: 'DELETE',
  })

  setResponseStatus(event, 204)
  return null
})
