import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  const companyId = getRouterParam(event, 'company')

  if (!companyId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing company id' })
  }

  const body = await readBody<Record<string, unknown>>(event)

  return await fetchCrmGeneral(event, `companies/${companyId}`, {
    method: 'PATCH',
    body,
  })
})
