import type { ApiObject } from '~~/server/types/api/common'
import { callPrivateApi } from '~~/server/utils/privateApi'

export default defineEventHandler(async (event): Promise<ApiObject> => {
  const body = (await readBody<Record<string, unknown>>(event)) as ApiObject

  return callPrivateApi<ApiObject>(event, '/api/v1/recruit/resumes/review', {
    method: 'POST',
    body,
  })
})
