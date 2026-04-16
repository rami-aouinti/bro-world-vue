export type SessionUserWithToken = {
  token?: string
}

export function resolveAuthToken(user: SessionUserWithToken | null) {
  const token = user?.token?.trim()

  if (!token || token === 'undefined' || token === 'null') {
    return null
  }

  return token
}
