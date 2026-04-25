import { getHeader, readMultipartFormData } from 'h3'
import { mutateCrmGeneral } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(async (event) => {
  const taskRequest = getRouterParam(event, 'taskRequest')

  if (!taskRequest) {
    throw createError({ statusCode: 400, statusMessage: 'Missing task request id' })
  }

  const contentType = (getHeader(event, 'content-type') || '').toLowerCase()
  if (!contentType.includes('multipart/form-data')) {
    throw createError({ statusCode: 400, statusMessage: 'Expected multipart/form-data' })
  }

  const parts = (await readMultipartFormData(event)) || []
  const formData = new FormData()

  for (const part of parts) {
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

  return mutateCrmGeneral<Record<string, unknown>>(event, `task-requests/${taskRequest}/files`, {
    method: 'POST',
    body: formData,
  })
})
