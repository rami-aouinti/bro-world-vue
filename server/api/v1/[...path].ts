const HOP_BY_HOP_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'transfer-encoding',
])

const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function rewriteLegacyEndpoint(endpoint: string) {
  if (endpoint.startsWith('/blog/private/')) {
    return endpoint.replace('/blog/private/', '/private/blog/')
  }

  return endpoint
}

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event)
  const baseUrl = String(runtimeConfig.public.apiBaseUrl || '').replace(/\/+$/, '')

  if (!baseUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing public.apiBaseUrl runtime config',
    })
  }

  const path = getRouterParam(event, 'path')
  const endpoint = rewriteLegacyEndpoint(path ? `/${path}` : '')
  const targetUrl = `${baseUrl}${endpoint}`

  const method = event.method.toUpperCase()
  const requestHeaders = getRequestHeaders(event)

  const headers = Object.fromEntries(
    Object.entries(requestHeaders).filter(([name]) => !HOP_BY_HOP_HEADERS.has(name.toLowerCase())),
  )

  const response = await $fetch.raw(targetUrl, {
    method,
    headers,
    query: getQuery(event),
    body: METHODS_WITH_BODY.has(method) ? await readRawBody(event, false) : undefined,
    redirect: 'manual',
  })

  setResponseStatus(event, response.status, response.statusText)

  for (const [name, value] of response.headers.entries()) {
    if (!HOP_BY_HOP_HEADERS.has(name.toLowerCase())) {
      setResponseHeader(event, name, value)
    }
  }

  return response._data
})
