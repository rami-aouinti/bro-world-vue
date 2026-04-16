import type { ApiQuery } from '~~/server/types/api/common'
import type { RecruitOwnerJobApplication } from '~~/server/types/api/recruit'
import { cachedPrivateGet } from '~~/server/utils/privateApi'

export default defineEventHandler(
  async (event): Promise<RecruitOwnerJobApplication[]> => {
    const query = Object.fromEntries(
      Object.entries(getQuery(event)).filter(([, value]) => value !== null),
    ) as ApiQuery

    return cachedPrivateGet<RecruitOwnerJobApplication[]>(
      event,
      '/api/v1/recruit/general/private/job-applications',
      {
        query,
      },
    )
  },
)
