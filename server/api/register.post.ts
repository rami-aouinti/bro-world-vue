import {
  createSessionFromToken,
  fetchTokenWithRegister,
} from '../utils/authSession'

type RegisterBody = {
  email?: string
  password?: string
  repeatPassword?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RegisterBody>(event)

  if (!body.email || !body.password || !body.repeatPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'email, password and repeatPassword are required',
    })
  }

  const token = await fetchTokenWithRegister(event, {
    email: body.email,
    password: body.password,
    repeatPassword: body.repeatPassword,
  })

  const user = await createSessionFromToken(event, token)

  return { user }
})
