import { callPrivateApi } from '../../utils/privateApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  const notificationId = getRouterParam(event, 'notification')

  if (!notificationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid notification id',
    })
  }

  return callPrivateApi(event, `/notifications/${notificationId}`)
})
