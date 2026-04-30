import { cachedCrmGeneralGet } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event) => {
  const taskRequest = getRouterParam(event, 'taskRequest')

  if (!taskRequest) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing task request id',
    })
  }

  return cachedCrmGeneralGet(
    event,
    `task-requests/${taskRequest}/gitlab/branches`,
    getQuery(event) as Record<string, string | number | boolean | undefined>,
  )
})
