import type { RecruitStatusHistoryResponse } from '~~/server/types/api/recruit'
import { cachedPrivateGet } from '~~/server/utils/privateApi'

export default defineEventHandler(async (event): Promise<RecruitStatusHistoryResponse> => {
  const applicationSlug = getRouterParam(event, 'applicationSlug')
  const applicationId = getRouterParam(event, 'applicationId')

  if (!applicationSlug || !applicationId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing application slug or id' })
  }

  return cachedPrivateGet<RecruitStatusHistoryResponse>(
    event,
    `/api/v1/recruit/applications/${applicationSlug}/private/applications/${applicationId}/status-history`,
  )
})
