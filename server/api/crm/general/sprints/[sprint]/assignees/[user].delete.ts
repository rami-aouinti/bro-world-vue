import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<null> => {
  const sprint = getRouterParam(event, 'sprint')
  const user = getRouterParam(event, 'user')

  if (!sprint || !user) {
    throw createError({ statusCode: 400, statusMessage: 'Missing sprint or user id' })
  }

  await mutateCrmGeneral(event, `sprints/${sprint}/assignees/${user}`, {
    method: 'DELETE',
  })

  setResponseStatus(event, 204)
  return null
})
