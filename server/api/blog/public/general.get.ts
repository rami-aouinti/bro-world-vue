import { getPaginationQuery } from '../utils'

export default defineEventHandler(async (event): Promise<unknown> => {
  const runtimeConfig = useRuntimeConfig(event)
  const { page, limit } = getPaginationQuery(event)

  return $fetch(`${runtimeConfig.public.apiBaseUrl}/api/v1/public/blogs/general`, {
    query: { page, limit },
    headers: {
      accept: 'application/json',
    },
  })
})
