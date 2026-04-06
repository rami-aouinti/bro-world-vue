type LoginBody = {
  username?: string
  password?: string
}

type TokenResponse = {
  token: string
}

type UserProfile = {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  language: string
  locale: string
  timezone: string
  photo: string
  coins: number
  roles: string[]
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginBody>(event)

  if (!body.username || !body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'username and password are required',
    })
  }

  const runtimeConfig = useRuntimeConfig(event)

  const tokenResponse = await $fetch<TokenResponse>(
    `${runtimeConfig.public.apiBaseUrl}/auth/get_token`,
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: {
        username: body.username,
        password: body.password,
      },
    },
  )

  const userProfile = await $fetch<UserProfile>(`${runtimeConfig.public.apiBaseUrl}/profile`, {
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${tokenResponse.token}`,
    },
  })

  const user = {
    ...userProfile,
    token: tokenResponse.token,
  }

  await setUserSession(event, { user })

  return { user }
})
