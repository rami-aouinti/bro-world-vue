import type { H3Event } from 'h3'
import type { SessionUser } from '~/types/session'
import { getServerPublicAxios, resolveServerApiUrl } from './http/axiosClient'

type TokenResponse = {
  token: string
}

type UserProfile = Omit<SessionUser, 'token'>

export async function fetchUserProfileFromToken(
  event: H3Event,
  token: string,
): Promise<SessionUser> {
  const client = getServerPublicAxios(event)

  const userProfileResponse = await client.get<UserProfile>(
    resolveServerApiUrl(event, '/profile'),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return {
    ...userProfileResponse.data,
    token,
  }
}

export async function fetchTokenWithPassword(
  event: H3Event,
  payload: { username: string; password: string },
): Promise<string> {
  const client = getServerPublicAxios(event)

  const tokenResponse = await client.post<TokenResponse>(
    resolveServerApiUrl(event, '/auth/get_token'),
    payload,
  )

  return tokenResponse.data.token
}

export async function fetchTokenWithSocialLogin(
  event: H3Event,
  payload: {
    email: string
    provider: string
    providerId: string
    image?: string
    firstName?: string
    lastName?: string
  },
): Promise<string> {
  const client = getServerPublicAxios(event)

  const tokenResponse = await client.post<TokenResponse>(
    resolveServerApiUrl(event, '/auth/social_login'),
    payload,
  )

  return tokenResponse.data.token
}

export async function fetchTokenWithRegister(
  event: H3Event,
  payload: { email: string; password: string; repeatPassword: string },
): Promise<string> {
  const client = getServerPublicAxios(event)

  const tokenResponse = await client.post<TokenResponse>(
    resolveServerApiUrl(event, '/auth/register'),
    payload,
  )

  return tokenResponse.data.token
}

export async function createSessionFromToken(event: H3Event, token: string) {
  const user = await fetchUserProfileFromToken(event, token)
  await setUserSession(event, { user })
  return user
}
