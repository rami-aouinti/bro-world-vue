import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<null> => {
  const task = getRouterParam(event, 'task')

  if (!task) {
    throw createError({ statusCode: 400, statusMessage: 'Missing task id' })
  }

  await mutateCrmGeneral(event, `tasks/${task}`, {
    method: 'DELETE',
  })

  setResponseStatus(event, 204)
  return null
})
