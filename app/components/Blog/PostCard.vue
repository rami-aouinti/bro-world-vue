<script setup lang="ts">
import { formatRelativeTime } from '../../utils/formatRelativeTime'

type BlogReaction = {
  type: string | null
  count?: number
  isAuthor?: boolean
  author?: {
    id?: string
    username?: string | null
    firstName?: string | null
    lastName?: string | null
    displayName?: string | null
    photo?: string | null
  } | null
}

type BlogReactionType = {
  code: string
  label: string
}

type BlogAuthor = {
  firstName: string | null
  lastName: string | null
  username: string | null
  photo: string | null
  displayName: string
}

type BlogComment = {
  id: string | number
  content: string
  createdAt: string | null
  isAuthor: boolean
  author?: BlogAuthor | null
  children?: BlogComment[]
  reactions?: BlogReaction[]
}

type BlogPost = {
  id: string | number
  slug?: string | null
  author?: BlogAuthor | null
  createdAt: string | null
  content: string
  mediaUrl?: string | null
  sharedUrl?: string | null
  isAuthor: boolean
  comments?: BlogComment[]
  reactions?: BlogReaction[]
  sharesCount?: number
}

const props = withDefaults(
  defineProps<{
    post: BlogPost
    canInteract?: boolean
    reactionTypes?: BlogReactionType[]
  }>(),
  {
    canInteract: true,
    reactionTypes: () => [],
  },
)

const emit = defineEmits<{
  like: [post: BlogPost]
  reactPost: [payload: { post: BlogPost; code: string }]
  reactComment: [
    payload: { post: BlogPost; comment: BlogComment; code: string },
  ]
  comment: [post: BlogPost]
  share: [post: BlogPost]
  createComment: [payload: { post: BlogPost; content: string }]
  reply: [payload: { post: BlogPost; comment: BlogComment; content: string }]
  editPost: [post: BlogPost]
  deletePost: [post: BlogPost]
  editComment: [payload: { post: BlogPost; comment: BlogComment }]
  deleteComment: [payload: { post: BlogPost; comment: BlogComment }]
}>()

const { locale, t } = useI18n()
const theme = useTheme()
const replyTo = ref<BlogComment | null>(null)
const showComments = ref(false)
const isLightTheme = computed(() => !theme.current.value.dark)

const formattedDate = computed(() => {
  return formatRelativeTime(locale.value, props.post.createdAt)
})

const commentsCount = computed(() => props.post.comments?.length ?? 0)
const authorName = computed(() => {
  const author = props.post.author
  if (!author) {
    return t('blog.post.fallbackTitle')
  }

  const fullName = [author.firstName, author.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()

  return (
    author.displayName ||
    fullName ||
    author.username ||
    t('blog.post.fallbackTitle')
  )
})
const authorPhoto = computed(() => {
  const photo = props.post.author?.photo
  if (typeof photo !== 'string') {
    return null
  }

  const normalizedPhoto = photo.trim()
  return normalizedPhoto.length > 0 ? normalizedPhoto : null
})
const authorProfilePath = computed(() => {
  const username = props.post.author?.username?.trim()
  return username ? `/user/${encodeURIComponent(username)}/profile` : null
})
const postDetailPath = computed(() => {
  const slug = props.post.slug?.trim()
  return slug ? `/blog/${encodeURIComponent(slug)}/post` : null
})
const normalizedReactions = computed(() =>
  (props.post.reactions || [])
    .filter(
      (reaction) =>
        typeof reaction.type === 'string' && reaction.type.length > 0,
    )
    .map((reaction) => ({
      ...reaction,
      type: reaction.type as string,
    })),
)

function submitComment(content: string) {
  if (!props.canInteract) {
    return
  }

  emit('createComment', { post: props.post, content })
}

function submitReply(payload: { comment: BlogComment; content: string }) {
  if (!props.canInteract) {
    return
  }

  emit('reply', {
    post: props.post,
    comment: payload.comment,
    content: payload.content,
  })

  if (replyTo.value?.id === payload.comment.id) {
    replyTo.value = null
  }
}

function togglePostLike() {
  if (!props.canInteract) {
    return
  }

  emit('like', props.post)
}

function onReply(comment: BlogComment) {
  if (!props.canInteract) {
    return
  }

  showComments.value = true

  if (replyTo.value?.id === comment.id) {
    replyTo.value = null
    return
  }

  replyTo.value = comment
}

function toggleComments() {
  if (!props.canInteract) {
    return
  }

  showComments.value = !showComments.value
}

function onCreateComment(content: string) {
  if (!props.canInteract) {
    return
  }

  showComments.value = true
  submitComment(content)
}

function onShare() {
  if (!props.canInteract) {
    return
  }

  emit('share', props.post)
}

function isInteractiveElement(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return false
  }

  return Boolean(
    target.closest(
      'a, button, input, textarea, [role="button"], .v-btn, .v-input, .v-field',
    ),
  )
}

async function onPostBodyClick(event: MouseEvent) {
  if (!postDetailPath.value || isInteractiveElement(event.target)) {
    return
  }

  await navigateTo(postDetailPath.value)
}
</script>

<template>
  <v-card
    rounded="xl"
    class="post-card"
    :class="{
      'post-card--light': isLightTheme,
    }"
    elevation="0"
  >
    <v-card-item class="pb-1">
      <template #prepend>
        <NuxtLink
          v-if="authorProfilePath"
          :to="authorProfilePath"
          class="post-author-link"
          @click.stop
        >
          <v-avatar size="52" color="grey-darken-2" class="me-3">
            <img
              v-if="authorPhoto"
              :src="authorPhoto"
              :alt="`${authorName} avatar`"
              class="post-avatar-image"
            />
            <v-icon v-else icon="mdi-account" />
          </v-avatar>
        </NuxtLink>
        <div v-else class="post-author-link">
          <v-avatar size="52" color="grey-darken-2" class="me-3">
            <img
              v-if="authorPhoto"
              :src="authorPhoto"
              :alt="`${authorName} avatar`"
              class="post-avatar-image"
            />
            <v-icon v-else icon="mdi-account" />
          </v-avatar>
        </div>
      </template>

      <v-card-title class="text-h6 font-weight-bold">
        <NuxtLink
          v-if="authorProfilePath"
          :to="authorProfilePath"
          class="post-author-link"
          @click.stop
        >
          {{ authorName }}
        </NuxtLink>
        <span v-else class="post-author-link">{{ authorName }}</span>
      </v-card-title>
      <v-card-subtitle class="text-medium-emphasis">
        {{ formattedDate }} ·
        <v-icon size="14" icon="mdi-account-group-outline" class="ms-1" />
      </v-card-subtitle>

      <template #append>
        <ClientOnly>
          <v-menu v-if="post.isAuthor" location="bottom end">
            <template #activator="{ props: menuProps }">
              <v-btn
                v-bind="menuProps"
                icon="mdi-dots-horizontal"
                :aria-label="t('common.edit')"
                size="small"
                variant="text"
              />
            </template>

            <v-list density="compact" min-width="140">
              <v-list-item
                prepend-icon="mdi-pencil-outline"
                :title="t('blog.post.menu.edit')"
                @click="emit('editPost', post)"
              />
              <v-list-item
                prepend-icon="mdi-delete-outline"
                :title="t('blog.post.menu.delete')"
                base-color="error"
                @click="emit('deletePost', post)"
              />
            </v-list>
          </v-menu>
        </ClientOnly>
      </template>
    </v-card-item>

    <v-card-text
      class="pt-1"
      :class="{ 'post-body--clickable': Boolean(postDetailPath) }"
      @click="onPostBodyClick"
    >
      <p class="text-body-1 post-content">{{ post.content }}</p>

      <v-img
        v-if="post.mediaUrl"
        :src="post.mediaUrl"
        :alt="`Post media by ${authorName}`"
        rounded="lg"
        cover
        max-height="420"
        class="mb-3"
      />

      <a
        v-if="post.sharedUrl"
        :href="post.sharedUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="text-decoration-none"
      >
        {{ post.sharedUrl }}
      </a>
    </v-card-text>

    <v-card-text class="pt-0 pb-2">
      <div class="d-flex align-center justify-space-between">
        <BlogReactionSummary :reactions="normalizedReactions" />
      </div>

      <BlogPostActionsBar
        :comments-count="commentsCount"
        :shares-count="post.sharesCount || 0"
        :can-interact="canInteract"
        :reaction-types="reactionTypes"
        @like="togglePostLike"
        @react="emit('reactPost', { post, code: $event })"
        @comment="toggleComments"
        @share="onShare"
      />
    </v-card-text>

    <v-card-text v-if="showComments" class="pt-1 pb-1">
      <BlogCommentComposer
        mode="comment"
        :disabled="!canInteract"
        :placeholder="t('blog.comment.placeholders.addComment')"
        @submit="onCreateComment"
      />
    </v-card-text>

    <v-card-text v-if="showComments && post.comments?.length" class="pt-1 pb-2">
      <BlogCommentThread
        :comments="post.comments"
        :can-interact="canInteract"
        :active-reply-id="replyTo?.id ?? null"
        :reaction-types="reactionTypes"
        @reply="onReply"
        @submit-reply="submitReply"
        @react="
          emit('reactComment', {
            post,
            comment: $event.comment,
            code: $event.code,
          })
        "
        @edit="emit('editComment', { post, comment: $event })"
        @delete="emit('deleteComment', { post, comment: $event })"
      />
    </v-card-text>
  </v-card>
</template>

<style scoped>
.post-card {
  background: linear-gradient(
    240deg,
    rgba(var(--v-theme-primary), 0.18) 0%,
    transparent 20%
  );
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.post-card--light {
  background: linear-gradient(
    240deg,
    rgba(var(--v-theme-primary), 0.18) 0%,
    transparent 20%
  );
  border: 1px solid rgba(15, 23, 42, 0.1);
}

.post-content {
  font-size: clamp(1rem, 1.5vw + 0.75rem, 1.2rem);
  line-height: 1.65;
  margin-bottom: 1rem;
  text-align: left;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.post-body--clickable {
  cursor: pointer;
}

.post-author-link {
  text-decoration: none;
  color: inherit;
}

.post-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.text-decoration-none {
  overflow-wrap: anywhere;
  word-break: break-word;
}

@media (max-width: 600px) {
  .post-card :deep(.v-card-title) {
    font-size: 1rem;
    line-height: 1.3;
  }

  .post-card :deep(.v-card-subtitle) {
    font-size: 0.78rem;
  }
}

.post-card--light :deep(.comment-input .v-field) {
  background: #f7f8fb;
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.post-card--light :deep(.comment-bubble) {
  background: #f4f6fb;
  border: 1px solid rgba(15, 23, 42, 0.08);
}
</style>
