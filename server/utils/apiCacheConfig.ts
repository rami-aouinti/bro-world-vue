export const CACHE_TTL_BY_DOMAIN = {
  default: 120,
  notifications: 30,
  references: 1800,
  sports: 120,
  football: 120,
  blog: 180,
  chat: 20,
  calendar: 120,
  application: 300,
  users: 90,
  stories: 60,
  library: 120,
  games: 300,
  quiz: 300,
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
  football: 'football',
  footballs: 'football',
  library: 'library',
  game: 'games',
  games: 'games',
  quiz: 'quiz',
}

const SPORTS_LIKE_CACHE_TTL_BY_PROFILE: Record<CacheProfile, number> = {
  default: CACHE_TTL_BY_DOMAIN.football,
  reference: 60 * 60 * 24 * 30,
  live: 15,
}

const CACHE_PROFILE_BY_SUFFIX: Record<string, CacheProfile> = {
  default: 'default',
  reference: 'reference',
  live: 'live',
}

export function resolveCacheProfileFromSuffix(suffix?: string | null): CacheProfile {
  if (!suffix) {
    return 'default'
  }

  return CACHE_PROFILE_BY_SUFFIX[suffix] ?? 'default'
}

export function resolveCacheTtl(
  domain: CacheDomain,
  profile: CacheProfile = 'default',
) {
  if (domain === 'sports' || domain === 'football') {
    return SPORTS_LIKE_CACHE_TTL_BY_PROFILE[profile]
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
