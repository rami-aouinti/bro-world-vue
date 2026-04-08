import type { ApplicationApiResponse } from '~~/server/types/api/application'
export default defineEventHandler(
  async (event): Promise<ApplicationApiResponse> => {
    const runtimeConfig = useRuntimeConfig(event)
    const query = getQuery(event)
    const page = Number(query.page ?? 1)
    const limit = Number(query.limit ?? 20)

    return $fetch<ApplicationApiResponse>(
      `${runtimeConfig.public.apiBaseUrl}/application/public`,
      {
        query: { page, limit },
        headers: {
          accept: 'application/json',
        },
      },
    )
  },
)
