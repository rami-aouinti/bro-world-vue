import { privateApi } from '~/utils/http/privateApi'
import { normalizeHttpError } from '../utils/httpError'

type UnknownRecord = Record<string, unknown>

type BlogAuthor = {
  id: string | number
  username: string | null
  firstName: string | null
  lastName: string | null
  photo: string | null
  displayName: string
  raw: UnknownRecord
}

type BlogReaction = {
  id: string | number
  type: string | null
  count: number
  isAuthor: boolean
  author: BlogAuthor | null
  raw: UnknownRecord
}

type BlogComment = {
  id: string | number
  content: string
  createdAt: string | null
  updatedAt: string | null
  isAuthor: boolean
  author: BlogAuthor | null
  children: BlogComment[]
  reactions: BlogReaction[]
  raw: UnknownRecord
}

type BlogPost = {
  id: string | number
  slug: string | null
  author: BlogAuthor | null
  title: string | null
  content: string
  createdAt: string | null
  updatedAt: string | null
  mediaUrl: string | null
  sharedUrl: string | null
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

const ALLOWED_REACTION_TYPES = new Set(['like', 'heart', 'laugh', 'celebrate'])

function toRecord(value: unknown): UnknownRecord {
  return typeof value === 'object' && value !== null
    ? (value as UnknownRecord)
    : {}
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

function pickId(value: unknown): string | number {
  if (typeof value === 'number' || typeof value === 'string') {
    return value
  }

  const record = toRecord(value)
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
  const count = pickNumber(reaction.count, NaN)
  const hasActor =
    pickId(reaction.author ?? reaction.user) || pickId(reaction.authorId)

  return {
    id: pickId(reaction),
    type:
      pickNullableString(reaction.type) ?? pickNullableString(reaction.code),
    count: Number.isFinite(count) ? count : hasActor ? 1 : 0,
    isAuthor: pickBoolean(reaction.isAuthor, false),
    author: normalizeAuthor(reaction.author ?? reaction.user),
    raw: reaction,
  }
}

function normalizeAuthor(input: unknown): BlogAuthor | null {
  if (typeof input === 'string' && input.trim()) {
    return {
      id: '',
      username: null,
      firstName: null,
      lastName: null,
      photo: null,
      displayName: input.trim(),
      raw: {},
    }
  }

  const author = toRecord(input)
  if (Object.keys(author).length === 0) {
    return null
  }

  const firstName = pickNullableString(author.firstName)
  const lastName = pickNullableString(author.lastName)
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()
  const username = pickNullableString(author.username)

  return {
    id: pickId(author),
    username,
    firstName,
    lastName,
    photo:
      pickNullableString(author.photo) ?? pickNullableString(author.avatar),
    displayName:
      fullName || username || pickNullableString(author.name) || 'Utilisateur',
    raw: author,
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
    author: normalizeAuthor(comment.author ?? comment.user),
    children: readNestedArray(comment, ['children', 'comments']).map(
      normalizeComment,
    ),
    reactions: readNestedArray(comment, ['reactions']).map(normalizeReaction),
    raw: comment,
  }
}

function normalizePost(input: unknown): BlogPost {
  const post = toRecord(input)

  return {
    id: pickId(post),
    slug: pickNullableString(post.slug),
    author: normalizeAuthor(post.author ?? post.user),
    title: pickNullableString(post.title),
    content: pickString(post.content),
    createdAt: pickNullableString(post.createdAt),
    updatedAt: pickNullableString(post.updatedAt),
    mediaUrl:
      pickNullableString(post.mediaUrl) ?? pickNullableString(post.media),
    sharedUrl:
      pickNullableString(post.sharedUrl) ?? pickNullableString(post.url),
    isAuthor: pickBoolean(post.isAuthor, false),
    comments: readNestedArray(post, ['comments']).map(normalizeComment),
    reactions: readNestedArray(post, ['reactions']).map(normalizeReaction),
    raw: post,
  }
}

function normalizePagination(
  response: UnknownRecord,
  fallback: BlogPagination,
): BlogPagination {
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
  optimistic?: boolean
}

export function useBlogFeed(options: UseBlogFeedOptions = {}) {
  const { loggedIn } = useUserSession()
  const mode = computed<BlogFeedMode>(() => options.mode ?? 'general')
  const optimistic = computed(() => options.optimistic ?? true)

  const posts = ref<BlogPost[]>([])
  const pagination = ref<BlogPagination>({ ...DEFAULT_PAGINATION })
  const reactionTypes = ref<BlogReactionType[]>([])
  const pending = ref(false)
  const error = ref<unknown>(null)

  const feedEndpoint = computed(() => {
    if (mode.value === 'mine') {
      return '/api/blog/private/posts/mine'
    }

    return loggedIn.value
      ? '/api/blog/private/general'
      : '/api/blog/public/general'
  })

  async function fetchReactionTypes() {
    const response = await $fetch<unknown>('/api/blog/public/reaction-types')
    const record = toRecord(response)

    reactionTypes.value = normalizeReactionTypes(
      record.reactionTypes ?? record.types ?? record.data ?? response,
    )
  }

  async function fetchPage(
    page: number,
    mergeMode: 'replace' | 'append' = 'replace',
  ) {
    pending.value = true
    error.value = null

    try {
      const query = {
        page,
        limit: pagination.value.limit,
      }

      let response: unknown

      try {
        response = await $fetch<unknown>(feedEndpoint.value, { query })
      } catch (err) {
        const shouldFallbackToPublicGeneral =
          mode.value === 'general' &&
          feedEndpoint.value === '/api/blog/private/general' &&
          normalizeHttpError(err).isUnauthorized

        if (!shouldFallbackToPublicGeneral) {
          throw err
        }

        response = await $fetch<unknown>('/api/blog/public/general', { query })
      }

      const record = toRecord(response)
      const payload = toRecord(record.data)
      const source = Object.keys(payload).length > 0 ? payload : record

      const normalizedPosts = readNestedArray(source, ['posts', 'items']).map(
        normalizePost,
      )
      const normalizedPagination = normalizePagination(source, pagination.value)

      posts.value =
        mergeMode === 'append'
          ? [...posts.value, ...normalizedPosts]
          : normalizedPosts
      pagination.value = normalizedPagination

      if (reactionTypes.value.length === 0) {
        await fetchReactionTypes()
      }
    } catch (err) {
      error.value = err
      throw err
    } finally {
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
    const blogId = pickString(body.blogId).trim()
    const payload = blogId ? { ...body, blogId } : body
    await privateApi.request(
      '/api/blog/private/general',
      {
        method: 'POST',
        body: payload,
      },
    )

    await refresh()
  }

  function isSameId(left: string | number, right: string | number): boolean {
    return String(left) === String(right)
  }

  function findPostIndex(postId: string | number): number {
    return posts.value.findIndex((post) => isSameId(post.id, postId))
  }

  function findCommentInTree(
    comments: BlogComment[],
    commentId: string | number,
  ): { list: BlogComment[]; index: number } | null {
    for (let index = 0; index < comments.length; index += 1) {
      const comment = comments[index]
      if (!comment) {
        continue
      }

      if (isSameId(comment.id, commentId)) {
        return { list: comments, index }
      }

      const nested = findCommentInTree(comment.children, commentId)
      if (nested) {
        return nested
      }
    }

    return null
  }

  function updateEntityById(
    target: 'post' | 'comment',
    id: string | number,
    updater: (entry: BlogPost | BlogComment) => BlogPost | BlogComment | null,
  ): boolean {
    if (target === 'post') {
      const postIndex = findPostIndex(id)
      if (postIndex < 0) {
        return false
      }

      const postEntry = posts.value[postIndex]
      if (!postEntry) {
        return false
      }

      const next = updater(postEntry)
      if (!next) {
        posts.value.splice(postIndex, 1)
        return true
      }

      posts.value[postIndex] = next as BlogPost
      return true
    }

    for (const post of posts.value) {
      const location = findCommentInTree(post.comments, id)
      if (!location) {
        continue
      }

      const commentEntry = location.list[location.index]
      if (!commentEntry) {
        return false
      }

      const next = updater(commentEntry)
      if (!next) {
        location.list.splice(location.index, 1)
        return true
      }

      location.list[location.index] = next as BlogComment
      return true
    }

    return false
  }

  function clonePostsState(): BlogPost[] {
    try {
      return structuredClone(posts.value)
    } catch {
      return JSON.parse(JSON.stringify(posts.value)) as BlogPost[]
    }
  }

  async function runMutation(
    optimisticPatch: (() => void) | null,
    mutation: () => Promise<void>,
  ) {
    const snapshot =
      optimistic.value && optimisticPatch ? clonePostsState() : null

    if (optimistic.value && optimisticPatch) {
      optimisticPatch()
    }

    try {
      await mutation()
    } catch (err) {
      if (snapshot) {
        posts.value = snapshot
      }

      throw err
    }
  }

  function readMutationSource(response: unknown): UnknownRecord {
    const record = toRecord(response)
    const payload = toRecord(record.data)

    return Object.keys(payload).length > 0 ? payload : record
  }

  function pickFirstRecord(
    source: UnknownRecord,
    keys: string[],
  ): UnknownRecord | null {
    for (const key of keys) {
      const nested = toRecord(source[key])
      if (Object.keys(nested).length > 0) {
        return nested
      }
    }

    return null
  }

  async function comment(postId: string | number, body: UnknownRecord) {
    await runMutation(
      optimistic.value
        ? () => {
            const postIndex = findPostIndex(postId)
            if (postIndex < 0) {
              return
            }
            const postEntry = posts.value[postIndex]
            if (!postEntry) {
              return
            }

            const draft = normalizeComment({
              id: `tmp-${Date.now()}`,
              content: pickString(body.content),
              children: [],
              reactions: [],
            })
            postEntry.comments = [draft, ...postEntry.comments]
          }
        : null,
      async () => {
        const response = await privateApi.request<unknown>(
          `/api/blog/private/posts/${postId}/comments`,
          {
            method: 'POST',
            body,
          },
        )

        const source = readMutationSource(response)
        const commentPayload = pickFirstRecord(source, [
          'comment',
          'item',
          'data',
        ])
        const postIndex = findPostIndex(postId)

        if (!commentPayload || postIndex < 0) {
          await refresh()
          return
        }
        const postEntry = posts.value[postIndex]
        if (!postEntry) {
          await refresh()
          return
        }

        const commentEntry = normalizeComment(commentPayload)
        postEntry.comments = [
          commentEntry,
          ...postEntry.comments.filter(
            (entry) => !String(entry.id).startsWith('tmp-'),
          ),
        ]
      },
    )
  }

  async function react(
    target: 'post' | 'comment',
    id: string | number,
    body?: UnknownRecord,
    action: 'create' | 'update' | 'delete' = 'create',
    reactionId?: string | number,
  ) {
    const base =
      action === 'create'
        ? target === 'post'
          ? `/api/blog/private/posts/${id}/reactions`
          : `/api/blog/private/comments/${id}/reactions`
        : `/api/blog/private/reactions/${reactionId}`
    const method =
      action === 'create' ? 'POST' : action === 'update' ? 'PATCH' : 'DELETE'
    const reactionType = pickNullableString(body?.type)?.toLowerCase()

    if (action !== 'delete') {
      if (!reactionType || !ALLOWED_REACTION_TYPES.has(reactionType)) {
        throw createError({
          statusCode: 400,
          statusMessage: `Unsupported reaction type: ${String(body?.type ?? '')}`,
        })
      }
    }

    if (action !== 'create' && !reactionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'reactionId is required to update or delete a reaction',
      })
    }

    await runMutation(
      optimistic.value
        ? () => {
            updateEntityById(target, id, (entry) => {
              const normalizedReactions = [...(entry.reactions ?? [])]
              const ownIndex = normalizedReactions.findIndex(
                (reaction) => reaction.isAuthor,
              )
              const ownReaction =
                ownIndex >= 0 ? normalizedReactions[ownIndex] : null

              if (action === 'delete') {
                if (ownIndex >= 0) {
                  normalizedReactions.splice(ownIndex, 1)
                }

                return {
                  ...entry,
                  reactions: normalizedReactions,
                }
              }

              if (!reactionType) {
                return entry
              }

              if (ownReaction && ownIndex >= 0) {
                normalizedReactions[ownIndex] = {
                  ...ownReaction,
                  type: reactionType,
                  count: 1,
                  isAuthor: true,
                }
              } else {
                normalizedReactions.unshift(
                  normalizeReaction({
                    id: `tmp-react-${Date.now()}`,
                    type: reactionType,
                    count: 1,
                    isAuthor: true,
                  }),
                )
              }

              return {
                ...entry,
                reactions: normalizedReactions,
              }
            })
          }
        : null,
      async () => {
        const response = await privateApi.request<unknown>(base, {
          method,
          body,
        })

        const source = readMutationSource(response)
        const parent = pickFirstRecord(source, [
          target,
          'post',
          'comment',
          'item',
        ])
        const reactionsSource = parent
          ? readNestedArray(parent, ['reactions'])
          : readNestedArray(source, ['reactions'])

        if (reactionsSource.length === 0) {
          await refresh()
          return
        }

        const updated = updateEntityById(target, id, (entry) => ({
          ...entry,
          reactions: reactionsSource.map(normalizeReaction),
        }))

        if (!updated) {
          await refresh()
        }
      },
    )
  }

  async function edit(
    target: 'post' | 'comment',
    id: string | number,
    body: UnknownRecord,
  ) {
    const url =
      target === 'post'
        ? `/api/blog/private/posts/${id}`
        : `/api/blog/private/comments/${id}`

    await runMutation(
      optimistic.value
        ? () => {
            updateEntityById(target, id, (entry) => ({
              ...entry,
              ...body,
            }))
          }
        : null,
      async () => {
        const response = await privateApi.request<unknown>(url, {
          method: 'PATCH',
          body,
        })

        const source = readMutationSource(response)
        const item = pickFirstRecord(source, [
          target,
          'post',
          'comment',
          'item',
        ])

        if (!item) {
          await refresh()
          return
        }

        const patched = updateEntityById(target, id, () =>
          target === 'post' ? normalizePost(item) : normalizeComment(item),
        )

        if (!patched) {
          await refresh()
        }
      },
    )
  }

  async function remove(target: 'post' | 'comment', id: string | number) {
    const url =
      target === 'post'
        ? `/api/blog/private/posts/${id}`
        : `/api/blog/private/comments/${id}`

    await runMutation(
      optimistic.value
        ? () => {
            updateEntityById(target, id, () => null)
          }
        : null,
      async () => {
        await privateApi.request(url, {
          method: 'DELETE',
        })

        const removed = updateEntityById(target, id, () => null)
        if (!removed) {
          await refresh()
        }
      },
    )
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
