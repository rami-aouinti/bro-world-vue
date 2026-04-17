import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event): Promise<null> => {
  const company = getRouterParam(event, 'company')

  if (!company) {
    throw createError({ statusCode: 400, statusMessage: 'Missing company id' })
  }

  await mutateCrmGeneral(event, `companies/${company}`, {
    method: 'DELETE',
  })

  setResponseStatus(event, 204)
  return null
})
