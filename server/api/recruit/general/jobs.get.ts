import type { RecruitJobsListResponse } from '~/types/world/jobs'
import { resolveApiUrl } from '~~/server/utils/resolveApiUrl'

export default defineEventHandler(
  async (event): Promise<RecruitJobsListResponse> => {
    const runtimeConfig = useRuntimeConfig(event)
    const query = getQuery(event)

    return $fetch<RecruitJobsListResponse>(
      resolveApiUrl(runtimeConfig.public.apiBaseUrl, '/recruit/general/jobs'),
      {
        query,
        headers: {
          accept: 'application/json',
        },
      },
    )
  },
)
