import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<null> => {
  const sprint = getRouterParam(event, 'sprint')
  const task = getRouterParam(event, 'task')

  if (!sprint || !task) {
    throw createError({ statusCode: 400, statusMessage: 'Missing sprint or task id' })
  }

  await mutateCrmGeneral(event, `sprints/${sprint}/tasks/${task}`, {
    method: 'PUT',
  })

  setResponseStatus(event, 204)
  return null
})
