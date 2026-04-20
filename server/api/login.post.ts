import {
  createSessionFromToken,
  fetchTokenWithPassword,
} from '../utils/authSession'

type LoginBody = {
  username?: string
  password?: string
}

export default defineEventHandler(async (event) => {
  const body = (await readBody<LoginBody | undefined>(event)) ?? {}

  if (!body.username || !body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'username and password are required',
    })
  }

  const token = await fetchTokenWithPassword(event, {
    username: body.username,
    password: body.password,
  })

  const user = await createSessionFromToken(event, token)

  return { user }
})
