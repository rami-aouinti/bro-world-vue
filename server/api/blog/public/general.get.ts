import { getPaginationQuery } from '../utils'
import { resolveApiUrl } from '../../../utils/resolveApiUrl'

export default defineEventHandler(async (event): Promise<unknown> => {
  const runtimeConfig = useRuntimeConfig(event)
  const { page, limit } = getPaginationQuery(event)

  return $fetch(resolveApiUrl(runtimeConfig.public.apiBaseUrl, '/api/v1/public/blogs/general'), {
    query: { page, limit },
    headers: {
      accept: 'application/json',
    },
  })
})
