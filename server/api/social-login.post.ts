import {
  createSessionFromToken,
  fetchTokenWithSocialLogin,
} from '../utils/authSession'

type SocialLoginBody = {
  email?: string
  provider?: string
  providerId?: string
  image?: string
  firstName?: string
  lastName?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<SocialLoginBody>(event)

  if (!body.email || !body.provider || !body.providerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'email, provider and providerId are required',
    })
  }

  const token = await fetchTokenWithSocialLogin(event, {
    email: body.email,
    provider: body.provider,
    providerId: body.providerId,
    image: body.image,
    firstName: body.firstName,
    lastName: body.lastName,
  })

  const user = await createSessionFromToken(event, token)

  return { user }
})
