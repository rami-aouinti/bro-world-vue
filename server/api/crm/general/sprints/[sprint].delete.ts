import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<null> => {
  const sprint = getRouterParam(event, 'sprint')

  if (!sprint) {
    throw createError({ statusCode: 400, statusMessage: 'Missing sprint id' })
  }

  await mutateCrmGeneral(event, `sprints/${sprint}`, {
    method: 'DELETE',
  })

  setResponseStatus(event, 204)
  return null
})
