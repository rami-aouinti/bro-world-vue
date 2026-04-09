import type { UsersApiResponse } from '~~/server/types/api/users'
import { resolveApiUrl } from '../../utils/resolveApiUrl'

export default defineEventHandler(async (event): Promise<UsersApiResponse> => {
  const runtimeConfig = useRuntimeConfig(event)

  return $fetch<UsersApiResponse>(
    resolveApiUrl(runtimeConfig.public.apiBaseUrl, '/api/v1/public/users'),
    {
      headers: {
        accept: 'application/json',
      },
    },
  )
})
