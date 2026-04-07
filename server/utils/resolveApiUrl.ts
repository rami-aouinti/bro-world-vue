export function resolveApiUrl(baseUrl: string, endpoint: string): string {
  const normalizedBase = baseUrl.replace(/\/+$/, '')
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

  if (normalizedBase.endsWith('/api/v1') && normalizedEndpoint.startsWith('/api/v1/')) {
    return `${normalizedBase}${normalizedEndpoint.slice('/api/v1'.length)}`
  }

  return `${normalizedBase}${normalizedEndpoint}`
}
