<script setup lang="ts">
definePageMeta({
  title: 'Blog post',
})

type UnknownRecord = Record<string, unknown>

type BlogAuthorView = {
  firstName: string | null
  lastName: string | null
  username: string | null
  photo: string | null
  displayName: string
}

type BlogReactionView = {
  id: string | number
  type: string | null
  count?: number
  isAuthor: boolean
  author?: BlogAuthorView | null
}

type BlogCommentView = {
  id: string | number
  content: string
  createdAt: string | null
  isAuthor: boolean
  author: BlogAuthorView | null
  children: BlogCommentView[]
  reactions: BlogReactionView[]
}

type BlogPostView = {
  id: string | number
  slug: string | null
  title: string | null
  content: string
  createdAt: string | null
  author: BlogAuthorView | null
  comments: BlogCommentView[]
  reactions: BlogReactionView[]
  isAuthor: boolean
  sharedUrl: string | null
  mediaUrl: string | null
  mediaUrls: string[]
}

type BlogReactionType = {
  code: string
  label: string
}

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))
const { loggedIn } = useUserSession()

const { comment, react, delete: remove } = useBlogFeed({ mode: 'general' })

function toRecord(value: unknown): UnknownRecord {
  return typeof value === 'object' && value !== null
    ? (value as UnknownRecord)
    : {}
}

function pickNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function pickString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function pickArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function pickBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
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

function pickId(record: UnknownRecord): string | number {
  for (const candidate of [record.id, record._id, record.uuid]) {
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
      return nested.items as unknown[]
    }

    if (Array.isArray(nested.data)) {
      return nested.data as unknown[]
    }
  }

  return []
}

function normalizeAuthor(input: unknown): BlogAuthorView | null {
  const source = toRecord(input)
  if (Object.keys(source).length === 0) {
    return null
  }

  const firstName = pickNullableString(source.firstName)
  const lastName = pickNullableString(source.lastName)
  const username = pickNullableString(source.username)
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()

  return {
    firstName,
    lastName,
    username,
    photo:
      pickNullableString(source.photo) ?? pickNullableString(source.avatar),
    displayName:
      fullName || username || pickNullableString(source.name) || 'Utilisateur',
  }
}

function normalizeReaction(input: unknown): BlogReactionView {
  const reaction = toRecord(input)
  const count = pickNumber(reaction.count, NaN)
  const hasActor =
    pickId(toRecord(reaction.author ?? reaction.user)) ||
    pickId(toRecord({ id: reaction.authorId }))

  return {
    id: pickId(reaction),
    type:
      pickNullableString(reaction.type) ?? pickNullableString(reaction.code),
    count: Number.isFinite(count) ? count : hasActor ? 1 : 0,
    isAuthor: pickBoolean(reaction.isAuthor, false),
    author: normalizeAuthor(reaction.author ?? reaction.user),
  }
}

function normalizeComment(input: unknown): BlogCommentView {
  const comment = toRecord(input)

  return {
    id: pickId(comment),
    content: pickString(comment.content),
    createdAt: pickNullableString(comment.createdAt),
    isAuthor: pickBoolean(comment.isAuthor, false),
    author: normalizeAuthor(comment.author ?? comment.user),
    children: readNestedArray(comment, ['children', 'comments']).map(
      normalizeComment,
    ),
    reactions: readNestedArray(comment, ['reactions']).map(normalizeReaction),
  }
}

function normalizePost(source: unknown): BlogPostView | null {
  const root = toRecord(source)
  const post = toRecord(root.post ?? root.data ?? root.item ?? root)

  if (Object.keys(post).length === 0) {
    return null
  }

  return {
    id: pickId(post),
    slug: pickNullableString(post.slug),
    title: pickNullableString(post.title),
    content: pickString(post.content),
    createdAt: pickNullableString(post.createdAt),
    author: normalizeAuthor(post.author ?? post.user),
    comments: readNestedArray(post, ['comments']).map(normalizeComment),
    reactions: readNestedArray(post, ['reactions']).map(normalizeReaction),
    isAuthor: pickBoolean(post.isAuthor, false),
    sharedUrl:
      pickNullableString(post.sharedUrl) ?? pickNullableString(post.url),
    mediaUrl:
      pickNullableString(post.mediaUrl) ??
      pickNullableString(post.filePath) ??
      pickNullableString(post.media),
    mediaUrls: pickArray(post.mediaUrls)
      .map((entry) => pickNullableString(entry))
      .filter((entry): entry is string => Boolean(entry)),
  }
}

const fetchPost = async () =>
  (await ($fetch as any)(
    `/api/blog/posts/${encodeURIComponent(slug.value)}`,
  )) as unknown

const {
  data: postResponse,
  pending,
  error,
  refresh: refreshPost,
} = await useAsyncData(() => `blog-post-${slug.value}`, fetchPost, {
  watch: [slug],
})

const { data: reactionTypesResponse } = await useAsyncData(
  'blog-reaction-types',
  () => $fetch('/api/blog/public/reaction-types'),
)

const post = computed<BlogPostView | null>(() =>
  normalizePost(postResponse.value),
)

const reactionTypes = computed<BlogReactionType[]>(() => {
  const root = toRecord(reactionTypesResponse.value)
  const source =
    root.reactionTypes ?? root.types ?? root.data ?? reactionTypesResponse.value

  if (!Array.isArray(source)) {
    return []
  }

  return source
    .map((entry) => {
      const reaction = toRecord(entry)
      const code = pickString(reaction.code).trim()
      const label = pickString(reaction.label, pickString(reaction.name)).trim()

      if (!code) {
        return null
      }

      return {
        code,
        label: label || code,
      }
    })
    .filter((entry): entry is BlogReactionType => Boolean(entry))
})

function findOwnReaction(reactions?: BlogReactionView[]) {
  return reactions?.find((entry) => entry.isAuthor)
}

async function createComment(payload: { post: BlogPostView; content: string }) {
  if (!loggedIn.value) {
    return
  }

  await comment(payload.post.id, { content: payload.content })
  await refreshPost()
}

async function reactToPost(payload: { post: BlogPostView; code: string }) {
  if (!loggedIn.value) {
    return
  }

  const existing = findOwnReaction(payload.post.reactions)

  if (!existing) {
    await react('post', payload.post.id, { type: payload.code }, 'create')
  } else if (
    (existing.type ?? '').toLowerCase() === payload.code.toLowerCase()
  ) {
    await react('post', payload.post.id, undefined, 'delete', existing.id)
  } else {
    await react(
      'post',
      payload.post.id,
      { type: payload.code },
      'update',
      existing.id,
    )
  }

  await refreshPost()
}

async function reactToComment(payload: {
  post: BlogPostView
  comment: BlogCommentView
  code: string
}) {
  if (!loggedIn.value) {
    return
  }

  const existing = findOwnReaction(payload.comment.reactions)

  if (!existing) {
    await react('comment', payload.comment.id, { type: payload.code }, 'create')
  } else if (
    (existing.type ?? '').toLowerCase() === payload.code.toLowerCase()
  ) {
    await react('comment', payload.comment.id, undefined, 'delete', existing.id)
  } else {
    await react(
      'comment',
      payload.comment.id,
      { type: payload.code },
      'update',
      existing.id,
    )
  }

  await refreshPost()
}

async function replyToComment(payload: {
  post: { id: string | number }
  comment: { id: string | number }
  content: string
}) {
  if (!loggedIn.value) {
    return
  }

  await comment(payload.post.id, {
    content: payload.content,
    parentCommentId: payload.comment.id,
  })
  await refreshPost()
}

async function deletePost(post: BlogPostView) {
  await remove('post', post.id)
  await navigateTo('/blog')
}

async function deleteComment(payload: {
  post: BlogPostView
  comment: BlogCommentView
}) {
  await remove('comment', payload.comment.id)
  await refreshPost()
}
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <AppLeftDrawerUserEntry />
      </template>
    </AppPageDrawers>
    <v-container fluid>
      <div class="mx-auto" style="max-width: 920px">
        <v-progress-linear
          v-if="pending"
          indeterminate
          color="primary"
          class="mb-4"
        />

        <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">
          Impossible de charger le post pour le slug:
          <strong>{{ slug }}</strong>
        </v-alert>

        <BlogPostCard
          v-else-if="post"
          :post="post"
          :can-interact="loggedIn"
          :reaction-types="reactionTypes"
          @create-comment="createComment"
          @reply="replyToComment"
          @like="reactToPost({ post: $event, code: 'like' })"
          @react-post="reactToPost"
          @react-comment="reactToComment"
          @delete-post="deletePost"
          @delete-comment="deleteComment"
        />
      </div>
    </v-container>
  </div>
</template>
