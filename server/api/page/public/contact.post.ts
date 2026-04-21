import { getServerPublicAxios, resolveServerApiUrl } from '~~/server/utils/http/axiosClient'

type PublicContactPayload = {
  firstName: string
  lastName: string
  email: string
  type: string
  message: string
}

function normalize(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<PublicContactPayload>>(event)

  const payload: PublicContactPayload = {
    firstName: normalize(body?.firstName),
    lastName: normalize(body?.lastName),
    email: normalize(body?.email).toLowerCase(),
    type: normalize(body?.type),
    message: normalize(body?.message),
  }

  if (
    !payload.firstName ||
    !payload.lastName ||
    !payload.email ||
    !payload.type ||
    !payload.message
  ) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'firstName, lastName, email, type and message are required',
    })
  }

  if (!isValidEmail(payload.email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'email must be a valid email address',
    })
  }

  const client = getServerPublicAxios(event)
  const response = await client.post(
    resolveServerApiUrl(event, '/api/v1/page/public/contact'),
    payload,
  )

  setResponseStatus(event, 201)
  return response.data
})
