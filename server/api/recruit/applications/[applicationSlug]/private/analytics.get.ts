import type { RecruitAnalyticsResponse } from '~~/server/types/api/recruit'
import { cachedPrivateGet } from '~~/server/utils/privateApi'

export default defineEventHandler(async (event): Promise<RecruitAnalyticsResponse> => {
  const applicationSlug = getRouterParam(event, 'applicationSlug')

  if (!applicationSlug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing application slug' })
  }

  return cachedPrivateGet<RecruitAnalyticsResponse>(
    event,
    `/api/v1/recruit/applications/${applicationSlug}/private/analytics`,
  )
})
