<script setup lang="ts">
import { formatDateTime } from '../../utils/formatDateTime'

type BlogReaction = {
  type: string | null
  count: number
  isAuthor?: boolean
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

const props = withDefaults(defineProps<{
  post: BlogPost
  reactionTypes?: BlogReactionType[]
}>(), {
  reactionTypes: () => [],
})

const emit = defineEmits<{
  like: [post: BlogPost]
  reactPost: [payload: { post: BlogPost, code: string }]
  reactComment: [payload: { post: BlogPost, comment: BlogComment, code: string }]
  comment: [post: BlogPost]
  share: [post: BlogPost]
  createComment: [payload: { post: BlogPost, content: string }]
  reply: [payload: { post: BlogPost, comment: BlogComment, content: string }]
  editPost: [post: BlogPost]
  deletePost: [post: BlogPost]
  editComment: [payload: { post: BlogPost, comment: BlogComment }]
  deleteComment: [payload: { post: BlogPost, comment: BlogComment }]
}>()

const { locale } = useI18n()
const theme = useTheme()
const replyTo = ref<BlogComment | null>(null)
const showComments = ref(false)
const isLightTheme = computed(() => !theme.current.value.dark)

const formattedDate = computed(() => {
  if (!props.post.createdAt) {
    return ''
  }

  return formatDateTime(locale.value, new Date(props.post.createdAt))
})

const commentsCount = computed(() => props.post.comments?.length ?? 0)
const authorName = computed(() => props.post.author?.displayName || 'Publication')
const authorPhoto = computed(() => props.post.author?.photo || null)
const normalizedReactions = computed(() =>
  (props.post.reactions || [])
    .filter((reaction) => typeof reaction.type === 'string' && reaction.type.length > 0)
    .map((reaction) => ({
      ...reaction,
      type: reaction.type as string,
    })),
)

function submitComment(content: string) {
  emit('createComment', { post: props.post, content })
}

function submitReply(payload: { comment: BlogComment, content: string }) {
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
  emit('like', props.post)
}

function onReply(comment: BlogComment) {
  showComments.value = true

  if (replyTo.value?.id === comment.id) {
    replyTo.value = null
    return
  }

  replyTo.value = comment
}

function toggleComments() {
  showComments.value = !showComments.value
}

function onCreateComment(content: string) {
  showComments.value = true
  submitComment(content)
}
</script>

<template>
  <v-card
    rounded="xl"
    class="post-card"
    :class="{ 'post-card--light': isLightTheme }"
    elevation="0"
  >
    <v-card-item class="pb-1">
      <template #prepend>
        <v-avatar size="52" color="grey-darken-2" class="me-3">
          <v-img v-if="authorPhoto" :src="authorPhoto" />
          <v-icon v-else icon="mdi-account" />
        </v-avatar>
      </template>

      <v-card-title class="text-h6 font-weight-bold">
        {{ authorName }}
      </v-card-title>
      <v-card-subtitle class="text-medium-emphasis">
        {{ formattedDate }} · <v-icon size="14" icon="mdi-account-group-outline" class="ms-1" />
      </v-card-subtitle>

      <template #append>
        <v-menu v-if="post.isAuthor" location="bottom end">
          <template #activator="{ props: menuProps }">
            <v-btn v-bind="menuProps" icon="mdi-dots-horizontal" size="small" variant="text" />
          </template>

          <v-list density="compact" min-width="140">
            <v-list-item
              prepend-icon="mdi-pencil-outline"
              title="Modifier"
              @click="emit('editPost', post)"
            />
            <v-list-item
              prepend-icon="mdi-delete-outline"
              title="Supprimer"
              base-color="error"
              @click="emit('deletePost', post)"
            />
          </v-list>
        </v-menu>
      </template>
    </v-card-item>

    <v-card-text class="pt-1">
      <p class="text-body-1 post-content">{{ post.content }}</p>

      <v-img
        v-if="post.mediaUrl"
        :src="post.mediaUrl"
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
        :reaction-types="reactionTypes"
        @like="togglePostLike"
        @react="emit('reactPost', { post, code: $event })"
        @comment="toggleComments"
        @share="emit('share', post)"
      />
    </v-card-text>

    <v-card-text v-if="showComments" class="pt-1 pb-1">
      <BlogCommentComposer
        mode="comment"
        placeholder="Ajouter un commentaire…"
        @submit="onCreateComment"
      />
    </v-card-text>

    <v-card-text v-if="showComments && post.comments?.length" class="pt-0">
      <BlogCommentThread
        :comments="post.comments"
        :active-reply-id="replyTo?.id ?? null"
        :reaction-types="reactionTypes"
        @reply="onReply"
        @submit-reply="submitReply"
        @react="emit('reactComment', { post, comment: $event.comment, code: $event.code })"
        @edit="emit('editComment', { post, comment: $event })"
        @delete="emit('deleteComment', { post, comment: $event })"
      />
    </v-card-text>
  </v-card>
</template>

<style scoped>
.post-card {
  background: linear-gradient(180deg, #1f2328 0%, #1b1d21 100%);
  color: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.post-card--light {
  background: #fff;
  color: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.1);
}

.post-content {
  font-size: 1.45rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  text-align: left;
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
