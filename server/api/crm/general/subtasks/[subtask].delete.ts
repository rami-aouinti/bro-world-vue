import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<null> => {
  const subtask = getRouterParam(event, 'subtask')

  if (!subtask) {
    throw createError({ statusCode: 400, statusMessage: 'Missing subtask id' })
  }

  await mutateCrmGeneral(event, `subtasks/${subtask}`, {
    method: 'DELETE',
  })

  setResponseStatus(event, 204)
  return null
})
