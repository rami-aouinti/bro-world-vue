import type { RecruitJobsStatsResponse } from '~~/server/types/api/recruit'
import { cachedPrivateGet } from '~~/server/utils/privateApi'

export default defineEventHandler(async (event): Promise<RecruitJobsStatsResponse> => {
  const applicationSlug = getRouterParam(event, 'applicationSlug')

  if (!applicationSlug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing application slug' })
  }

  return cachedPrivateGet<RecruitJobsStatsResponse>(
    event,
    `/api/v1/recruit/applications/${applicationSlug}/private/jobs/stats`,
  )
})
