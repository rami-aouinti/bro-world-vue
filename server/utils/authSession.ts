import type { H3Event } from 'h3'
import type { SessionUser } from '~/types/session'

type TokenResponse = {
  token: string
}

type UserProfile = Omit<SessionUser, 'token'>

export async function fetchUserProfileFromToken(
  event: H3Event,
  token: string,
): Promise<SessionUser> {
  const runtimeConfig = useRuntimeConfig(event)

  const userProfile = await $fetch<UserProfile>(
    `${runtimeConfig.public.apiBaseUrl}/profile`,
    {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return {
    ...userProfile,
    token,
  }
}

export async function fetchTokenWithPassword(
  event: H3Event,
  payload: { username: string; password: string },
): Promise<string> {
  const runtimeConfig = useRuntimeConfig(event)

  const tokenResponse = await $fetch<TokenResponse>(
    `${runtimeConfig.public.apiBaseUrl}/auth/get_token`,
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: payload,
    },
  )

  return tokenResponse.token
}

export async function fetchTokenWithSocialLogin(
  event: H3Event,
  payload: { email: string; provider: string; providerId: string },
): Promise<string> {
  const runtimeConfig = useRuntimeConfig(event)

  const tokenResponse = await $fetch<TokenResponse>(
    `${runtimeConfig.public.apiBaseUrl}/auth/social_login`,
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: payload,
    },
  )

  return tokenResponse.token
}

export async function fetchTokenWithRegister(
  event: H3Event,
  payload: { email: string; password: string; repeatPassword: string },
): Promise<string> {
  const runtimeConfig = useRuntimeConfig(event)

  const tokenResponse = await $fetch<TokenResponse>(
    `${runtimeConfig.public.apiBaseUrl}/auth/register`,
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: payload,
    },
  )

  return tokenResponse.token
}

export async function createSessionFromToken(event: H3Event, token: string) {
  const user = await fetchUserProfileFromToken(event, token)
  await setUserSession(event, { user })
  return user
}
