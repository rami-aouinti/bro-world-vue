import { getRouterParam } from 'h3'
import type { UsersApiResponse } from '~~/server/types/api/users'
import { resolveApiUrl } from '../../../../utils/resolveApiUrl'

export default defineEventHandler(async (event): Promise<UsersApiResponse> => {
  const username = getRouterParam(event, 'username')

  if (!username) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing username',
    })
  }

  const runtimeConfig = useRuntimeConfig(event)

  return $fetch<UsersApiResponse>(
    resolveApiUrl(
      runtimeConfig.public.apiBaseUrl,
      `/api/v1/public/user/${encodeURIComponent(username)}`,
    ),
    {
      headers: {
        accept: 'application/json',
      },
    },
  )
})
