import {
  createSessionFromToken,
  fetchTokenWithSocialLogin,
} from '../../utils/authSession'
import {
  extractSocialProfileImage,
  extractSocialProfileNames,
} from '../../utils/socialProfile'

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

export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    const payload = ensureSocialPayload({
      email: user.email,
      providerId: user.sub,
    })

    const names = extractSocialProfileNames(user)

    const token = await fetchTokenWithSocialLogin(event, {
      email: payload.email,
      provider: 'google',
      providerId: payload.providerId,
      image: extractSocialProfileImage(user),
      firstName: names.firstName,
      lastName: names.lastName,
    })

    await createSessionFromToken(event, token)

    return sendRedirect(event, '/')
  },
})
