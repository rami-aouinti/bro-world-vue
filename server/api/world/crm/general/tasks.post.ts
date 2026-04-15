import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  const body = await readBody<Record<string, unknown>>(event)
  return await fetchCrmGeneral('tasks', {
    method: 'POST',
    body,
  })
})
