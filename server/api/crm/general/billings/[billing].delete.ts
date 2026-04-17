import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<null> => {
  const billing = getRouterParam(event, 'billing')

  if (!billing) {
    throw createError({ statusCode: 400, statusMessage: 'Missing billing id' })
  }

  await mutateCrmGeneral(event, `billings/${billing}`, {
    method: 'DELETE',
  })

  setResponseStatus(event, 204)
  return null
})
