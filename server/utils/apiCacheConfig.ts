export const CACHE_TTL_BY_DOMAIN = {
  default: 120,
  notifications: 30,
  references: 1800,
  sports: 120,
  blog: 180,
  chat: 20,
  calendar: 120,
  application: 300,
  users: 90,
  stories: 60,
  library: 120,
  games: 300,
} as const

export type CacheDomain = keyof typeof CACHE_TTL_BY_DOMAIN
export type CacheProfile = 'default' | 'reference' | 'live'

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
  sports: 'sports',
  sport: 'sports',
  football: 'sports',
  library: 'library',
  game: 'games',
  games: 'games',
}

const SPORTS_CACHE_TTL_BY_PROFILE: Record<CacheProfile, number> = {
  default: CACHE_TTL_BY_DOMAIN.sports,
  reference: 1800,
  live: 15,
}

export function resolveCacheTtl(
  domain: CacheDomain,
  profile: CacheProfile = 'default',
) {
  if (domain === 'sports') {
    return SPORTS_CACHE_TTL_BY_PROFILE[profile]
  }

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
