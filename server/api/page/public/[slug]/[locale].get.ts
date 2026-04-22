import { isPublicPageSlug } from '~~/shared/publicPageSlugs'
import { cachedPublicGet } from '~~/server/utils/publicApi'
import type { ApiResponse } from '~~/server/types/api/common'

const SUPPORTED_LOCALES = new Set(['en', 'fr', 'es', 'de'])

export default defineEventHandler(async (event): Promise<ApiResponse> => {
  const slug = getRouterParam(event, 'slug')
  const locale = getRouterParam(event, 'locale')

  if (!slug || !isPublicPageSlug(slug)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported public page slug',
    })
  }

  if (!locale || !SUPPORTED_LOCALES.has(locale)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported locale',
    })
  }

  return cachedPublicGet<ApiResponse>(event, `/page/public/${slug}/${locale}`)
})
