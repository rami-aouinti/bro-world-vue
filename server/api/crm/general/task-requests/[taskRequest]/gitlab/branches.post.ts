import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event) => {
  const taskRequest = getRouterParam(event, 'taskRequest')

  if (!taskRequest) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing task request id',
    })
  }

  return mutateCrmGeneral<Record<string, unknown>>(
    event,
    `task-requests/${taskRequest}/gitlab/branches`,
    {
      method: 'POST',
      body: await readBody<Record<string, unknown>>(event),
    },
  )
})
