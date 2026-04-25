import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  const contactId = getRouterParam(event, 'contact')

  if (!contactId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing contact id' })
  }

  return await fetchCrmGeneral(event, `contacts/${contactId}`)
})
