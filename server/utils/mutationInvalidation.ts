import type { H3Event } from 'h3'
import type { SessionUser } from '~/types/session'
import {
  invalidateByPrefix,
  privateCachePrefix,
  publicCachePrefix,
  type CacheScope,
} from './apiCache'

type MutationInvalidationRule = {
  key: string
  prefixes: string[]
  scope: CacheScope
}

const MUTATION_INVALIDATION_RULES: MutationInvalidationRule[] = [
  { key: 'stories:create', scope: 'private', prefixes: ['stories'] },
  { key: 'stories:delete', scope: 'private', prefixes: ['stories'] },
  { key: 'blog:posts:create', scope: 'private', prefixes: ['blog'] },
  { key: 'blog:posts:update', scope: 'private', prefixes: ['blog'] },
  { key: 'blog:posts:delete', scope: 'private', prefixes: ['blog'] },
  { key: 'blog:posts:comments:create', scope: 'private', prefixes: ['blog'] },
  { key: 'blog:posts:comments:update', scope: 'private', prefixes: ['blog'] },
  { key: 'blog:posts:comments:delete', scope: 'private', prefixes: ['blog'] },
  { key: 'blog:posts:reactions:create', scope: 'private', prefixes: ['blog'] },
  { key: 'blog:posts:reactions:update', scope: 'private', prefixes: ['blog'] },
  { key: 'blog:posts:reactions:delete', scope: 'private', prefixes: ['blog'] },
  { key: 'blog:comments:reactions:create', scope: 'private', prefixes: ['blog'] },
  { key: 'blog:comments:reactions:update', scope: 'private', prefixes: ['blog'] },
  { key: 'blog:comments:reactions:delete', scope: 'private', prefixes: ['blog'] },
  { key: 'chat:conversations:update', scope: 'private', prefixes: ['chat'] },
  { key: 'chat:conversations:delete', scope: 'private', prefixes: ['chat'] },
  { key: 'chat:conversations:messages:create', scope: 'private', prefixes: ['chat'] },
  { key: 'chat:conversations:messages:read', scope: 'private', prefixes: ['chat', 'notifications'] },
  { key: 'chat:messages:update', scope: 'private', prefixes: ['chat'] },
  { key: 'chat:messages:delete', scope: 'private', prefixes: ['chat'] },
  { key: 'chat:messages:reactions:create', scope: 'private', prefixes: ['chat'] },
  { key: 'chat:reactions:update', scope: 'private', prefixes: ['chat'] },
  { key: 'chat:reactions:delete', scope: 'private', prefixes: ['chat'] },
  { key: 'calendar:events:create', scope: 'private', prefixes: ['calendar'] },
  { key: 'calendar:events:update', scope: 'private', prefixes: ['calendar'] },
  { key: 'calendar:events:cancel', scope: 'private', prefixes: ['calendar'] },
  { key: 'calendar:events:delete', scope: 'private', prefixes: ['calendar'] },
  { key: 'notifications:read-all', scope: 'private', prefixes: ['notifications'] },
  { key: 'library:folders:mutate', scope: 'private', prefixes: ['library'] },
  { key: 'library:files:mutate', scope: 'private', prefixes: ['library'] },
  { key: 'games:sessions:start', scope: 'private', prefixes: ['games'] },
  { key: 'games:sessions:finish', scope: 'private', prefixes: ['games'] },
  { key: 'users:block:create', scope: 'private', prefixes: ['users'] },
  { key: 'users:block:delete', scope: 'private', prefixes: ['users'] },
  { key: 'users:friends:action', scope: 'private', prefixes: ['users', 'notifications'] },
] as const

const MUTATION_RULES_BY_KEY = new Map(
  MUTATION_INVALIDATION_RULES.map((rule) => [rule.key, rule]),
)

function buildPrefix(scope: CacheScope, resourcePrefix: string, username?: string) {
  if (scope === 'public') {
    return publicCachePrefix(resourcePrefix)
  }

  return privateCachePrefix({ username, resourcePrefix })
}

export async function invalidateMutationCaches(event: H3Event, mutationKey: string) {
  const rule = MUTATION_RULES_BY_KEY.get(mutationKey)

  if (!rule) {
    throw createError({
      statusCode: 500,
      statusMessage: `Missing cache invalidation mapping for mutation: ${mutationKey}`,
    })
  }

  let username: string | undefined

  if (rule.scope === 'private') {
    const { user } = await requireUserSession(event)
    username = (user as SessionUser | null)?.username?.trim()

    if (!username) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Missing authenticated username',
      })
    }
  }

  await Promise.all(
    rule.prefixes.map((prefix) =>
      invalidateByPrefix(buildPrefix(rule.scope, prefix, username)),
    ),
  )
}

export function getMutationInvalidationRules() {
  return MUTATION_INVALIDATION_RULES
}
