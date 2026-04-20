interface GoogleTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope?: string
}

interface GoogleCalendarEventItem {
  id?: string
  summary?: string
  description?: string
  location?: string
  htmlLink?: string
  status?: string
  start?: {
    dateTime?: string
    date?: string
  }
  end?: {
    dateTime?: string
    date?: string
  }
}

interface GoogleCalendarEventsResponse {
  items?: GoogleCalendarEventItem[]
}

function renderOAuthMessagePage(payload: Record<string, unknown>) {
  const serializedPayload = JSON.stringify(payload).replace(/</g, '\\u003c')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Google Calendar callback</title>
  </head>
  <body>
    <script>
      (function () {
        const payload = ${serializedPayload};
        if (window.opener) {
          window.opener.postMessage(payload, window.location.origin);
          window.close();
          return;
        }
        document.body.innerText = payload.error || 'Google Calendar connected.';
      })();
    </script>
  </body>
</html>`
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  const query = getQuery(event)
  const code = typeof query.code === 'string' ? query.code : ''
  const oauthError = typeof query.error === 'string' ? query.error : ''

  if (oauthError) {
    setHeader(event, 'content-type', 'text/html; charset=utf-8')
    return renderOAuthMessagePage({
      source: 'google-calendar-oauth',
      error: oauthError,
    })
  }

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing Google OAuth authorization code.',
    })
  }

  const clientId = config.googleCalendar?.clientId?.trim()
  const clientSecret = config.googleCalendar?.clientSecret?.trim()
  const siteUrl = config.public.siteUrl?.trim()
  const redirectUri =
    config.googleCalendar?.redirectUri?.trim() ||
    `${siteUrl}/api/calendar/google/callback`

  if (!clientId || !clientSecret || !redirectUri) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Google Calendar OAuth is not configured (missing clientId, clientSecret or redirectUri).',
    })
  }

  const tokenResponse = await $fetch<GoogleTokenResponse>(
    'https://oauth2.googleapis.com/token',
    {
      method: 'POST',
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  )

  const calendarResponse = await $fetch<GoogleCalendarEventsResponse>(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      headers: {
        Authorization: `Bearer ${tokenResponse.access_token}`,
      },
      query: {
        maxResults: 20,
        singleEvents: true,
        orderBy: 'startTime',
        timeMin: new Date().toISOString(),
      },
    },
  )

  const events = (calendarResponse.items || [])
    .filter((item) => item.status !== 'cancelled')
    .map((item) => {
      const startAt = item.start?.dateTime || item.start?.date || ''
      const endAt = item.end?.dateTime || item.end?.date || startAt

      return {
        id: item.id || `${startAt}-${item.summary || 'google-event'}`,
        title: item.summary || 'Google Calendar event',
        description: item.description || null,
        startAt,
        endAt,
        location: item.location || null,
        htmlLink: item.htmlLink || null,
      }
    })

  setHeader(event, 'content-type', 'text/html; charset=utf-8')
  return renderOAuthMessagePage({
    source: 'google-calendar-oauth',
    token: tokenResponse.access_token,
    events,
  })
})
