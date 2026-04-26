import { readBody } from 'h3'
import { callPrivateApi } from '../../../../../utils/privateApi'

type ApplicationScopedConversationsPayload = {
  applicationSlug?: string
}

export default defineEventHandler(async (event) => {
  const payload = await readBody<ApplicationScopedConversationsPayload>(event).catch(
    () => ({}),
  )
  const applicationSlug = String(payload?.applicationSlug || '').trim()

  if (!applicationSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing applicationSlug',
    })
  }

  return callPrivateApi(
    event,
    '/api/v1/chat/private/applications/conversations',
    {
      method: 'GET',
      body: {
        applicationSlug,
      },
    },
  )
})
