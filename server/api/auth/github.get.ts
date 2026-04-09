import {
  createSessionFromToken,
  fetchTokenWithSocialLogin,
} from '../../utils/authSession'

function ensureSocialPayload(payload: {
  email?: string | null
  providerId?: string | null
}) {
  if (!payload.email || !payload.providerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing social provider email or provider id',
    })
  }

  return {
    email: payload.email,
    providerId: payload.providerId,
  }
}

export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user }) {
    const payload = ensureSocialPayload({
      email: user.email,
      providerId: user.id?.toString(),
    })

    const token = await fetchTokenWithSocialLogin(event, {
      email: payload.email,
      provider: 'github',
      providerId: payload.providerId,
    })

    await createSessionFromToken(event, token)

    return sendRedirect(event, '/')
  },
})
