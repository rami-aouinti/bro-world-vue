import type { H3Event } from 'h3'

export const ADMIN_RESOURCE_MAP = {
  users: 'user',
  'user-groups': 'user_group',
  roles: 'role',
  'api-keys': 'api_key',
  pages: 'page',
  configurations: 'configuration',
  platforms: 'platform',
  plugins: 'plugin',
} as const

export type AdminResourceKey = keyof typeof ADMIN_RESOURCE_MAP

export function resolveAdminResource(resource: string) {
  const normalized = resource.trim().toLowerCase() as AdminResourceKey
  const endpointResource = ADMIN_RESOURCE_MAP[normalized]

  if (!endpointResource) {
    throw createError({
      statusCode: 404,
      statusMessage: `Unsupported admin resource: ${resource}`,
    })
  }

  return {
    resourceKey: normalized,
    endpointResource,
  }
}

export function getAdminResource(event: H3Event) {
  const rawResource = getRouterParam(event, 'resource')

  if (!rawResource) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing resource parameter',
    })
  }

  return resolveAdminResource(rawResource)
}

export function sanitizeQuery(
  query: Record<string, unknown>,
): Record<string, string | number | boolean> {
  const entries = Object.entries(query).filter(([, value]) => value !== undefined)

  return Object.fromEntries(
    entries.map(([key, value]) => {
      if (Array.isArray(value)) {
        return [key, String(value.at(0) ?? '')]
      }

      if (typeof value === 'boolean' || typeof value === 'number') {
        return [key, value]
      }

      return [key, String(value)]
    }),
  )
}
