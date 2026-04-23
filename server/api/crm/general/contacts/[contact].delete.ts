import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<null> => {
  const contact = getRouterParam(event, 'contact')

  if (!contact) {
    throw createError({ statusCode: 400, statusMessage: 'Missing contact id' })
  }

  await mutateCrmGeneral(event, `contacts/${contact}`, {
    method: 'DELETE',
  })

  setResponseStatus(event, 204)
  return null
})
