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

function extractSocialProfileImage(user: Record<string, unknown>) {
  const image = user.avatar_url ?? user.picture ?? user.avatarUrl ?? user.image
  return typeof image === 'string' && image.length > 0 ? image : undefined
}

export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    const payload = ensureSocialPayload({
      email: user.email,
      providerId: user.sub,
    })

    const token = await fetchTokenWithSocialLogin(event, {
      email: payload.email,
      provider: 'google',
      providerId: payload.providerId,
      image: extractSocialProfileImage(user),
    })

    await createSessionFromToken(event, token)

    return sendRedirect(event, '/')
  },
})
