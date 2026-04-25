import {
  createSessionFromToken,
  fetchTokenWithSocialLogin,
} from '../../utils/authSession'

import {
  extractSocialProfileImage,
  extractSocialProfileNames,
} from '../../utils/socialProfile'

/**
 * Safe payload validator
 */
function ensureSocialPayload(payload: {
  email?: string | null
  providerId?: string | null
}) {
  if (!payload.providerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing provider id',
    })
  }

  if (!payload.email) {
    // 🔥 fallback safe email (évite crash OAuth)
    payload.email = `${payload.providerId}@microsoft.local`
  }

  return {
    email: payload.email,
    providerId: payload.providerId,
  }
}

/**
 * Decode JWT safely (Microsoft id_token)
 */
function decodeJwtPayload(token?: string | null): Record<string, any> {
  if (!token) return {}

  const parts = token.split('.')
  if (parts.length < 2 || !parts[1]) return {}

  try {
    const base64 = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(parts[1].length / 4) * 4, '=')

    return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'))
  } catch {
    return {}
  }
}

/**
 * Clean Microsoft email (VERY IMPORTANT)
 */
function normalizeEmail(email?: string | null): string | null {
  if (!email) return null

  const cleaned = email.toLowerCase().trim()

  // ignore invalid Azure external format
  if (cleaned.includes('#ext#')) return null

  if (!cleaned.includes('@')) return null

  return cleaned
}

/**
 * Extract BEST possible email from Microsoft
 */
function resolveMicrosoftEmail(
  user: Record<string, any>,
  idToken?: string | null,
): string | null {
  const tokenPayload = decodeJwtPayload(idToken)

  const candidates = [
    user.mail,
    user.email,
    user.otherMails?.[0],
    tokenPayload.email,
    tokenPayload.preferred_username,
    Array.isArray(tokenPayload.emails) ? tokenPayload.emails[0] : null,
    user.userPrincipalName, // fallback last
  ]

  for (const c of candidates) {
    const email = normalizeEmail(c)
    if (email) return email
  }

  return null
}

/**
 * Provider ID safe extraction
 */
function resolveProviderId(user: Record<string, any>): string {
  return (
    user.id ||
    user.oid ||
    user.sub ||
    user.userPrincipalName ||
    user.email ||
    'unknown-provider'
  )
}

export default defineOAuthMicrosoftEventHandler({
  async onSuccess(event, { user, tokens }) {
    const email = resolveMicrosoftEmail(user, tokens.id_token)
    const providerId = resolveProviderId(user)

    const payload = ensureSocialPayload({
      email,
      providerId,
    })

    const names = extractSocialProfileNames(user)

    try {
      const token = await fetchTokenWithSocialLogin(event, {
        email: payload.email,
        provider: 'microsoft',
        providerId: payload.providerId,
        image: extractSocialProfileImage(user),
        firstName: names.firstName,
        lastName: names.lastName,
      })

      await createSessionFromToken(event, token)

      return sendRedirect(event, '/')
    } catch (err) {
      console.error('[MICROSOFT_OAUTH_ERROR]', err)

      throw createError({
        statusCode: 500,
        statusMessage: 'OAuth login failed',
      })
    }
  },
})
