import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  return await fetchCrmGeneral(event, 'task-requests', {
    query: getQuery(event) as Record<string, string | number | boolean | undefined>,
  })
})
