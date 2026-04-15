import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  const companyId = getRouterParam(event, 'company')

  if (!companyId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing company id' })
  }

  return await fetchCrmGeneral(`companies/${companyId}`, {
    method: 'DELETE',
  })
})
