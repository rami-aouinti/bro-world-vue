import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<null> => {
  const task = getRouterParam(event, 'task')
  const subtask = getRouterParam(event, 'subtask')

  if (!task || !subtask) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing task or subtask id',
    })
  }

  await mutateCrmGeneral(event, `tasks/${task}/subtasks/${subtask}`, {
    method: 'DELETE',
  })

  setResponseStatus(event, 204)
  return null
})
