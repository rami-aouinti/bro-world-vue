import {
  createSessionFromToken,
  fetchTokenWithSocialLogin,
} from '../../utils/authSession'

import {
  extractSocialProfileImage,
  extractSocialProfileNames,
} from '../../utils/socialProfile'

/**
 * Decode Microsoft JWT safely
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
 * Normalize email safely
 */
function normalizeEmail(email?: string | null): string | null {
  if (!email) return null

  const cleaned = email.toLowerCase().trim()

  // Azure external guest format
  if (cleaned.includes('#ext#')) return null

  if (!cleaned.includes('@')) return null

  return cleaned
}

/**
 * Try extract real email from Microsoft
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
    user.userPrincipalName,
  ]

  for (const c of candidates) {
    const email = normalizeEmail(c)
    if (email) return email
  }

  return null
}

/**
 * Provider ID always stable
 */
function resolveProviderId(user: Record<string, any>): string {
  return (
    user.id ||
    user.oid ||
    user.sub ||
    user.userPrincipalName ||
    user.email ||
    cryptoRandomFallback()
  )
}

/**
 * fallback safe id (never empty)
 */
function cryptoRandomFallback(): string {
  return `microsoft_${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Safe payload
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

  return {
    email: payload.email ?? null,
    providerId: payload.providerId,
  }
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
        email: payload.email, // can be null safely handled downstream
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
