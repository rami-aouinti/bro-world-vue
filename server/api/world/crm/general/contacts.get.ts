import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(async (): Promise<unknown> => {
  return await fetchCrmGeneral('contacts')
})
