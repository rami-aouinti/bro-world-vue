export const CACHE_TTL_BY_DOMAIN = {
  default: 120,
  notifications: 30,
  references: 1800,
  blog: 180,
  chat: 20,
  calendar: 120,
  application: 300,
  users: 90,
  stories: 60,
  library: 120,
} as const

export type CacheDomain = keyof typeof CACHE_TTL_BY_DOMAIN

const DOMAIN_ALIASES: Record<string, CacheDomain> = {
  notification: 'notifications',
  notifications: 'notifications',
  chat: 'chat',
  calendar: 'calendar',
  application: 'application',
  users: 'users',
  stories: 'stories',
  blogs: 'blog',
  blog: 'blog',
  referentials: 'references',
  references: 'references',
  library: 'library',
}

export function resolveCacheTtl(domain: CacheDomain) {
  return CACHE_TTL_BY_DOMAIN[domain]
}

export function resolveCacheDomain(endpoint: string): CacheDomain {
  const cleaned = endpoint
    .replace(/^\/+|\/+$/g, '')
    .replace(/^api\/v1\/(public|private)\//, '')

  const [segment] = cleaned.split('/')

  if (!segment) {
    return 'default'
  }

  return DOMAIN_ALIASES[segment] ?? 'default'
}


export function resolveCacheResourcePrefix(endpoint: string) {
  return resolveCacheDomain(endpoint)
}
