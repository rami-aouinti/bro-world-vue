import type { Prisma } from '@prisma/client'
import { prisma } from './prisma'

type PersistentCacheEntry<T> = {
  payload: T
  expiresAt: Date
}

function hasDatabaseUrl() {
  const config = useRuntimeConfig()
  return Boolean(config.databaseUrl || process.env.DATABASE_URL)
}

function normalizePayload<T>(entry: { payload: Prisma.JsonValue }, now: Date) {
  if (
    entry.payload === null ||
    Array.isArray(entry.payload) ||
    typeof entry.payload !== 'object'
  ) {
    return null
  }

  const item = entry as PersistentCacheEntry<T>

  if (!(item.expiresAt instanceof Date) || item.expiresAt <= now) {
    return null
  }

  return item.payload
}

export async function getPersistentCached<T>(key: string): Promise<T | null> {
  if (!hasDatabaseUrl()) {
    return null
  }

  const now = new Date()

  try {
    const entry = await prisma.apiCacheEntry.findUnique({
      where: { key },
      select: { payload: true, expiresAt: true },
    })

    if (!entry) {
      return null
    }

    if (entry.expiresAt <= now) {
      await prisma.apiCacheEntry
        .delete({ where: { key } })
        .catch(() => undefined)
      return null
    }

    return normalizePayload<T>(entry, now)
  } catch {
    return null
  }
}

export async function setPersistentCached<T>(
  key: string,
  value: T,
  ttlSeconds: number,
) {
  if (!hasDatabaseUrl()) {
    return
  }

  const ttl = Math.floor(ttlSeconds)
  if (ttl <= 0) {
    await prisma.apiCacheEntry.delete({ where: { key } }).catch(() => undefined)
    return
  }

  const expiresAt = new Date(Date.now() + ttl * 1000)

  try {
    await prisma.apiCacheEntry.upsert({
      where: { key },
      create: {
        key,
        payload: value as Prisma.JsonValue,
        expiresAt,
      },
      update: {
        payload: value as Prisma.JsonValue,
        expiresAt,
      },
    })
  } catch {
    // Ignore DB errors to keep API routes resilient.
  }
}
