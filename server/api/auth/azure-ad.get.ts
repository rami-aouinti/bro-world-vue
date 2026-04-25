import {
  createSessionFromToken,
  fetchTokenWithSocialLogin,
} from '../../utils/authSession'

import {
  extractSocialProfileImage,
  extractSocialProfileNames,
} from '../../utils/socialProfile'

/**
 * Validate minimal OAuth payload
 */
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

/**
 * Decode JWT safely (Microsoft id_token)
 */
function decodeJwtPayload(token?: string | null): Record<string, unknown> {
  if (!token) return {}

  const parts = token.split('.')
  if (parts.length < 2 || !parts[1]) return {}

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')

    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'))
  } catch {
    return {}
  }
}

/**
 * Clean email (VERY IMPORTANT for Azure #EXT# issue)
 */
function normalizeEmail(email?: string | null): string | null {
  if (!email) return null

  const cleaned = email.toLowerCase().trim()

  // Azure external users protection
  if (cleaned.includes('#ext#')) return null

  if (!cleaned.includes('@')) return null

  return cleaned
}

/**
 * Extract REAL email from Microsoft OAuth response
 */
function resolveMicrosoftEmail(
  user: Record<string, any>,
  idToken?: string | null,
): string | null {
  const tokenPayload = decodeJwtPayload(idToken)

  const candidates = [
    user.mail,
    user.otherMails?.[0],
    user.preferredEmail,
    tokenPayload.email,
    tokenPayload.preferred_username,
    Array.isArray(tokenPayload.emails) ? tokenPayload.emails[0] : null,
  ]

  for (const candidate of candidates) {
    const email = normalizeEmail(candidate)
    if (email) return email
  }

  return null
}

export default defineOAuthMicrosoftEventHandler({
  async onSuccess(event, { user, tokens }) {
    const email = resolveMicrosoftEmail(user, tokens.id_token)

    const payload = ensureSocialPayload({
      email,
      providerId: user.id, // 🔥 IMPORTANT: NEVER use userPrincipalName
    })

    const names = extractSocialProfileNames(user)

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
  },
})
