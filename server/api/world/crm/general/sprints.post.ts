import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  const body = await readBody<Record<string, unknown>>(event)
  return await fetchCrmGeneral(event, 'sprints', {
    method: 'POST',
    body,
  })
})
