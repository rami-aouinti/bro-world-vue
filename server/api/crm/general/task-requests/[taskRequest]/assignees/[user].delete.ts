import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<null> => {
  const taskRequest = getRouterParam(event, 'taskRequest')
  const user = getRouterParam(event, 'user')

  if (!taskRequest || !user) {
    throw createError({ statusCode: 400, statusMessage: 'Missing task request id or user id' })
  }

  await mutateCrmGeneral(event, `task-requests/${taskRequest}/assignees/${user}`, {
    method: 'DELETE',
  })

  setResponseStatus(event, 204)
  return null
})
