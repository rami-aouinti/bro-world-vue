import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<null> => {
  const project = getRouterParam(event, 'project')
  const user = getRouterParam(event, 'user')

  if (!project || !user) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing project or user id',
    })
  }

  await mutateCrmGeneral(event, `projects/${project}/assignees/${user}`, {
    method: 'PUT',
  })

  setResponseStatus(event, 204)
  return null
})
