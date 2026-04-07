type SessionUserWithToken = {
  token?: string
}

function resolveAuthToken(user: SessionUserWithToken | null) {
  const token = user?.token?.trim()

  if (!token || token === 'undefined' || token === 'null') {
    return null
  }

  return token
}

export function usePublicApi() {
  const runtimeConfig = useRuntimeConfig()

  return $fetch.create({
    baseURL: runtimeConfig.public.apiBaseUrl,
    headers: {
      accept: 'application/json',
    },
  })
}

export function usePrivateApi() {
  const runtimeConfig = useRuntimeConfig()
  const { user } = useUserSession()

  return $fetch.create({
    baseURL: runtimeConfig.public.apiBaseUrl,
    headers: {
      accept: 'application/json',
    },
    onRequest({ options }) {
      const sessionUser = user.value as SessionUserWithToken | null
      const token = resolveAuthToken(sessionUser)

      if (!token) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Missing authentication token',
        })
      }

      options.headers = new Headers(options.headers)
      options.headers.set('Authorization', `Bearer ${token}`)
    },
  })
}
