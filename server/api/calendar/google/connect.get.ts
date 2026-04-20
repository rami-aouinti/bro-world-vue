export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  const clientId = config.googleCalendar?.clientId?.trim()
  const siteUrl = config.public.siteUrl?.trim()
  const redirectUri =
    config.googleCalendar?.redirectUri?.trim() ||
    `${siteUrl}/api/calendar/google/callback`

  if (!clientId || !redirectUri) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Google Calendar OAuth is not configured (missing clientId or redirectUri).',
    })
  }

  const scope = encodeURIComponent(
    'https://www.googleapis.com/auth/calendar.readonly',
  )

  const authorizationUrl =
    'https://accounts.google.com/o/oauth2/v2/auth' +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    '&response_type=code' +
    `&scope=${scope}` +
    '&access_type=offline' +
    '&prompt=consent'

  return { authorizationUrl }
})
