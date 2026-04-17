import type { RecruitPipelineResponse } from '~~/server/types/api/recruit'
import { cachedPrivateGet } from '~~/server/utils/privateApi'

export default defineEventHandler(async (event): Promise<RecruitPipelineResponse> => {
  const applicationSlug = getRouterParam(event, 'applicationSlug')

  if (!applicationSlug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing application slug' })
  }

  return cachedPrivateGet<RecruitPipelineResponse>(
    event,
    `/api/v1/recruit/private/${applicationSlug}/pipeline`,
  )
})
