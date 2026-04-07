type UnknownRecord = Record<string, unknown>

type BlogReaction = {
  id: string | number
  type: string | null
  count: number
  isAuthor: boolean
  raw: UnknownRecord
}

type BlogComment = {
  id: string | number
  content: string
  createdAt: string | null
  updatedAt: string | null
  isAuthor: boolean
  reactions: BlogReaction[]
  raw: UnknownRecord
}

type BlogPost = {
  id: string | number
  title: string | null
  content: string
  createdAt: string | null
  updatedAt: string | null
  isAuthor: boolean
  comments: BlogComment[]
  reactions: BlogReaction[]
  raw: UnknownRecord
}

type BlogPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
}

type BlogReactionType = {
  id: string | number
  code: string
  label: string
  raw: UnknownRecord
}

const DEFAULT_PAGINATION: BlogPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
}

function toRecord(value: unknown): UnknownRecord {
  return typeof value === 'object' && value !== null ? (value as UnknownRecord) : {}
}

function pickArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function pickString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function pickNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function pickNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return fallback
}

function pickBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function pickId(record: UnknownRecord): string | number {
  const candidates = [record.id, record._id, record.uuid]

  for (const candidate of candidates) {
    if (typeof candidate === 'number' || typeof candidate === 'string') {
      return candidate
    }
  }

  return ''
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

function normalizeReaction(input: unknown): BlogReaction {
  const reaction = toRecord(input)

  return {
    id: pickId(reaction),
    type: pickNullableString(reaction.type) ?? pickNullableString(reaction.code),
    count: pickNumber(reaction.count, 0),
    isAuthor: pickBoolean(reaction.isAuthor, false),
    raw: reaction,
  }
}

function normalizeComment(input: unknown): BlogComment {
  const comment = toRecord(input)

  return {
    id: pickId(comment),
    content: pickString(comment.content),
    createdAt: pickNullableString(comment.createdAt),
    updatedAt: pickNullableString(comment.updatedAt),
    isAuthor: pickBoolean(comment.isAuthor, false),
    reactions: readNestedArray(comment, ['reactions']).map(normalizeReaction),
    raw: comment,
  }
}

function normalizePost(input: unknown): BlogPost {
  const post = toRecord(input)

  return {
    id: pickId(post),
    title: pickNullableString(post.title),
    content: pickString(post.content),
    createdAt: pickNullableString(post.createdAt),
    updatedAt: pickNullableString(post.updatedAt),
    isAuthor: pickBoolean(post.isAuthor, false),
    comments: readNestedArray(post, ['comments']).map(normalizeComment),
    reactions: readNestedArray(post, ['reactions']).map(normalizeReaction),
    raw: post,
  }
}

function normalizePagination(response: UnknownRecord, fallback: BlogPagination): BlogPagination {
  const pagination = toRecord(response.pagination)

  const page = pickNumber(pagination.page, fallback.page)
  const limit = pickNumber(pagination.limit, fallback.limit)
  const total = pickNumber(pagination.total, fallback.total)
  const totalPages = pickNumber(pagination.totalPages, fallback.totalPages)

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: pickBoolean(pagination.hasNextPage, page < totalPages),
  }
}

function normalizeReactionTypes(input: unknown): BlogReactionType[] {
  return pickArray(input).map((entry) => {
    const record = toRecord(entry)

    return {
      id: pickId(record),
      code: pickString(record.code),
      label: pickString(record.label, pickString(record.name)),
      raw: record,
    }
  })
}

type BlogFeedMode = 'general' | 'mine'

type UseBlogFeedOptions = {
  mode?: BlogFeedMode
}

export function useBlogFeed(options: UseBlogFeedOptions = {}) {
  const { loggedIn } = useUserSession()
  const mode = computed<BlogFeedMode>(() => options.mode ?? 'general')

  const posts = ref<BlogPost[]>([])
  const pagination = ref<BlogPagination>({ ...DEFAULT_PAGINATION })
  const reactionTypes = ref<BlogReactionType[]>([])
  const pending = ref(false)
  const error = ref<unknown>(null)

  const feedEndpoint = computed(() => {
    if (mode.value === 'mine') {
      return '/api/blog/private/posts/mine'
    }

    return loggedIn.value ? '/api/blog/private/general' : '/api/blog/public/general'
  })

  async function fetchReactionTypes() {
    const response = await $fetch<unknown>('/api/blog/public/reaction-types')
    const record = toRecord(response)

    reactionTypes.value = normalizeReactionTypes(record.reactionTypes ?? record.types ?? record.data ?? response)
  }

  async function fetchPage(page: number, mode: 'replace' | 'append' = 'replace') {
    pending.value = true
    error.value = null

    try {
      const response = await $fetch<unknown>(feedEndpoint.value, {
        query: {
          page,
          limit: pagination.value.limit,
        },
      })

      const record = toRecord(response)
      const payload = toRecord(record.data)
      const source = Object.keys(payload).length > 0 ? payload : record

      const normalizedPosts = readNestedArray(source, ['posts', 'items']).map(normalizePost)
      const normalizedPagination = normalizePagination(source, pagination.value)

      posts.value = mode === 'append' ? [...posts.value, ...normalizedPosts] : normalizedPosts
      pagination.value = normalizedPagination

      if (reactionTypes.value.length === 0) {
        await fetchReactionTypes()
      }
    }
    catch (err) {
      error.value = err
      throw err
    }
    finally {
      pending.value = false
    }
  }

  async function refresh() {
    await fetchPage(1, 'replace')
  }

  async function loadMore() {
    if (!pagination.value.hasNextPage || pending.value) {
      return
    }

    await fetchPage(pagination.value.page + 1, 'append')
  }

  async function createPost(body: UnknownRecord) {
    await $fetch('/api/blog/private/general', {
      method: 'POST',
      body,
    })

    await refresh()
  }

  async function comment(postId: string | number, body: UnknownRecord) {
    await $fetch(`/api/blog/private/posts/${postId}/comments`, {
      method: 'POST',
      body,
    })

    await refresh()
  }

  async function react(
    target: 'post' | 'comment',
    id: string | number,
    body?: UnknownRecord,
    action: 'create' | 'update' | 'delete' = 'create',
  ) {
    const base = target === 'post' ? `/api/blog/private/posts/${id}/reactions` : `/api/blog/private/comments/${id}/reactions`
    const method = action === 'create' ? 'POST' : action === 'update' ? 'PATCH' : 'DELETE'

    await $fetch(base, {
      method,
      body,
    })

    await refresh()
  }

  async function edit(target: 'post' | 'comment', id: string | number, body: UnknownRecord, postId?: string | number) {
    if (target === 'comment' && (postId === undefined || postId === null || postId === '')) {
      throw createError({ statusCode: 400, statusMessage: 'postId is required to edit a comment' })
    }

    const url = target === 'post'
      ? `/api/blog/private/posts/${id}`
      : `/api/blog/private/posts/${postId}/comments/${id}`

    await $fetch(url, {
      method: 'PATCH',
      body,
    })

    await refresh()
  }

  async function remove(target: 'post' | 'comment', id: string | number, postId?: string | number) {
    if (target === 'comment' && (postId === undefined || postId === null || postId === '')) {
      throw createError({ statusCode: 400, statusMessage: 'postId is required to delete a comment' })
    }

    const url = target === 'post'
      ? `/api/blog/private/posts/${id}`
      : `/api/blog/private/posts/${postId}/comments/${id}`

    await $fetch(url, {
      method: 'DELETE',
    })

    await refresh()
  }

  return {
    posts,
    pagination,
    reactionTypes,
    pending,
    error,
    loadMore,
    refresh,
    createPost,
    comment,
    react,
    edit,
    delete: remove,
  }
}
