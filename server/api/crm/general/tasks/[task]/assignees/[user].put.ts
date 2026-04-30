import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<null> => {
  const task = getRouterParam(event, 'task')
  const user = getRouterParam(event, 'user')

  if (!task || !user) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing task or user id',
    })
  }

  await mutateCrmGeneral(event, `tasks/${task}/assignees/${user}`, {
    method: 'PUT',
  })

  setResponseStatus(event, 204)
  return null
})
