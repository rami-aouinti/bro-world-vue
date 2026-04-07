import { callPrivateApi } from '../../utils/privateApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  const query = getQuery(event)
  const page = Number(query.page ?? 1)
  const limit = Number(query.limit ?? 10)

  return callPrivateApi(
    event,
    `/application/private?page=${page}&limit=${limit}`,
  )
})
