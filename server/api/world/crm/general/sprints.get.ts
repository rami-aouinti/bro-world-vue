import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  return await fetchCrmGeneral(event, 'sprints', {
    query: getQuery(event) as Record<
      string,
      string | number | boolean | undefined
    >,
  })
})
