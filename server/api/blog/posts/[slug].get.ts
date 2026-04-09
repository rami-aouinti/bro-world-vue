import { getRouterParam } from 'h3'
import type { BlogApiResponse } from '~~/server/types/api/blog'
import type { SessionUser } from '~/types/session'
import { resolveApiUrl } from '../../../utils/resolveApiUrl'

export default defineEventHandler(async (event): Promise<BlogApiResponse> => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing post slug',
    })
  }

  const runtimeConfig = useRuntimeConfig(event)
  const endpoint = resolveApiUrl(
    runtimeConfig.public.apiBaseUrl,
    `/api/v1/blog/posts/${encodeURIComponent(slug)}`,
  )

  const headers = new Headers({
    accept: 'application/json',
  })

  const session = await getUserSession(event)
  const user = (session?.user as SessionUser | null) ?? null
  const token = user?.token?.trim()

  if (token && token !== 'undefined' && token !== 'null') {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return $fetch<BlogApiResponse>(endpoint, { headers })
})
