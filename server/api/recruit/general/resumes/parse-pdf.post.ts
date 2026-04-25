import type { ApiObject } from '~~/server/types/api/common'
import { callPrivateApi } from '~~/server/utils/privateApi'

export default defineEventHandler(async (event): Promise<ApiObject> => {
  const contentType = getHeader(event, 'content-type') || ''

  if (!contentType.includes('multipart/form-data')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Expected multipart/form-data',
    })
  }

  const parts = await readMultipartFormData(event)
  const formData = new FormData()

  for (const part of parts || []) {
    if (!part.name || !part.data) {
      continue
    }

    if (part.filename) {
      const file = new File([part.data], part.filename, {
        type: part.type || 'application/octet-stream',
      })
      formData.append(part.name, file)
      continue
    }

    formData.append(part.name, part.data.toString('utf-8'))
  }

  return callPrivateApi<ApiObject>(event, '/api/v1/recruit/resumes/parse-pdf', {
    method: 'POST',
    body: formData,
  })
})
