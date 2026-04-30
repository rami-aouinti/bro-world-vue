export function extractSocialProfileImage(user: Record<string, unknown>) {
  const image = user.avatar_url ?? user.picture ?? user.avatarUrl ?? user.image
  return typeof image === 'string' && image.length > 0 ? image : undefined
}

function normalizeName(value: unknown) {
  if (typeof value !== 'string') {
    return undefined
  }

  const normalized = value.trim().replace(/\s+/g, ' ')
  return normalized.length > 0 ? normalized : undefined
}

function splitDisplayName(name: string) {
  if (name.includes(',')) {
    const [rawLastName, rawFirstName] = name
      .split(',')
      .map((part) => part.trim())

    const firstName = normalizeName(rawFirstName)
    const lastName = normalizeName(rawLastName)

    if (firstName || lastName) {
      return { firstName, lastName }
    }
  }

  const parts = name.split(' ').filter(Boolean)

  if (parts.length === 0) {
    return { firstName: undefined, lastName: undefined }
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: undefined }
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

export function extractSocialProfileNames(user: Record<string, unknown>) {
  const firstName =
    normalizeName(user.first_name) ??
    normalizeName(user.firstName) ??
    normalizeName(user.given_name) ??
    normalizeName(user.givenName)

  const lastName =
    normalizeName(user.last_name) ??
    normalizeName(user.lastName) ??
    normalizeName(user.family_name) ??
    normalizeName(user.familyName)

  if (firstName || lastName) {
    return { firstName, lastName }
  }

  const displayName = normalizeName(user.name)

  if (!displayName) {
    return { firstName: undefined, lastName: undefined }
  }

  return splitDisplayName(displayName)
}
