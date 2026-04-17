import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<null> => {
  const project = getRouterParam(event, 'project')

  if (!project) {
    throw createError({ statusCode: 400, statusMessage: 'Missing project id' })
  }

  await mutateCrmGeneral(event, `projects/${project}`, {
    method: 'DELETE',
  })

  setResponseStatus(event, 204)
  return null
})
