import type { RecruitResume } from '~~/server/types/api/recruit'
import { cachedPrivateGet } from '~~/server/utils/privateApi'

export default defineEventHandler(async (event): Promise<RecruitResume[]> => {
  return cachedPrivateGet<RecruitResume[]>(
    event,
    '/api/v1/recruit/general/private/me/resumes',
  )
})
