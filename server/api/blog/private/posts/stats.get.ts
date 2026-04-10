import type { ApiResponse } from '~~/server/types/api/common'
import { callPrivateApi, getSessionAuth } from '../../../../utils/privateApi'
import {
  getCached,
  privateCacheKey,
  setCached,
} from '../../../../utils/apiCache'

type UnknownRecord = Record<string, unknown>

type BlogPostStatsResponse = {
  totalPosts: number
  totalComments: number
  totalReacts: number
}

function toRecord(value: unknown): UnknownRecord {
  return typeof value === 'object' && value !== null
    ? (value as UnknownRecord)
    : {}
}

function readNestedArray(record: UnknownRecord, keys: string[]): unknown[] {
  for (const key of keys) {
    const value = record[key]
    if (Array.isArray(value)) {
      return value
    }

    const nested = toRecord(value)

    if (Array.isArray(nested.items)) {
      return nested.items
    }

    if (Array.isArray(nested.data)) {
      return nested.data
    }
  }

  return []
}

function countReactions(entry: UnknownRecord, keys: string[]) {
  return readNestedArray(entry, keys).length
}

function computeStats(response: ApiResponse): BlogPostStatsResponse {
  const record = toRecord(response)
  const payload = toRecord(record.data)
  const source = Object.keys(payload).length > 0 ? payload : record
  const posts = readNestedArray(source, ['posts', 'items']).map(toRecord)

  return posts.reduce<BlogPostStatsResponse>(
    (accumulator, post) => {
      const comments = readNestedArray(post, ['comments']).map(toRecord)

      const postReactions = countReactions(post, ['reactions'])
      const commentReactions = comments.reduce(
        (total, comment) => total + countReactions(comment, ['reactions']),
        0,
      )

      return {
        totalPosts: accumulator.totalPosts + 1,
        totalComments: accumulator.totalComments + comments.length,
        totalReacts: accumulator.totalReacts + postReactions + commentReactions,
      }
    },
    {
      totalPosts: 0,
      totalComments: 0,
      totalReacts: 0,
    },
  )
}

export default defineEventHandler(
  async (event): Promise<BlogPostStatsResponse> => {
    const { username } = await getSessionAuth(event)

    const mineEndpoint = '/api/v1/private/blog/posts/mine'
    const mineQuery = { page: 1, limit: 100 }
    const cacheKey = privateCacheKey(
      username,
      '/api/blog/private/posts/stats',
      mineQuery,
    )

    const cached = await getCached<BlogPostStatsResponse>(cacheKey)
    if (cached) {
      return cached
    }

    const response = await callPrivateApi<ApiResponse>(event, mineEndpoint, {
      method: 'GET',
      query: mineQuery,
    })

    const stats = computeStats(response)
    await setCached(cacheKey, stats, 90)

    return stats
  },
)
