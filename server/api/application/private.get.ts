import { callPrivateApi } from '../../utils/privateApi'
import type { ApplicationApiResponse } from '~~/server/types/api/application'

export default defineEventHandler(
  async (event): Promise<ApplicationApiResponse> => {
    const query = getQuery(event)
    const page = Number(query.page ?? 1)
    const limit = Number(query.limit ?? 10)

    return callPrivateApi<ApplicationApiResponse>(
      event,
      `/application/private?page=${page}&limit=${limit}`,
    )
  },
)
