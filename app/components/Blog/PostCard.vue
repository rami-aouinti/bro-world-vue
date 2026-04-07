<script setup lang="ts">
import { formatDateTime } from '../../utils/formatDateTime'

type BlogReaction = {
  type: string | null
  count: number
}

type BlogComment = {
  id: string | number
  content: string
  createdAt: string | null
  isAuthor: boolean
  author?: string
  children?: BlogComment[]
}

type BlogPost = {
  id: string | number
  author?: string
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
}>(), {})

const emit = defineEmits<{
  like: [post: BlogPost]
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
const replyTo = ref<BlogComment | null>(null)

const formattedDate = computed(() => {
  if (!props.post.createdAt) {
    return ''
  }

  return formatDateTime(locale.value, new Date(props.post.createdAt))
})

const commentsCount = computed(() => props.post.comments?.length ?? 0)

function submitComment(content: string) {
  if (replyTo.value) {
    emit('reply', {
      post: props.post,
      comment: replyTo.value,
      content,
    })
    replyTo.value = null
    return
  }

  emit('createComment', { post: props.post, content })
}
</script>

<template>
  <v-card rounded="xl" class="post-card" elevation="0">
    <v-card-item class="pb-1">
      <template #prepend>
        <v-avatar size="52" color="grey-darken-2" class="me-3">
          <v-icon icon="mdi-account" />
        </v-avatar>
      </template>

      <v-card-title class="text-h6 font-weight-bold">
        {{ post.author || 'Auteur' }}
      </v-card-title>
      <v-card-subtitle class="text-medium-emphasis">
        {{ formattedDate }} · <v-icon size="14" icon="mdi-account-group-outline" class="ms-1" />
      </v-card-subtitle>

      <template #append>
        <div class="d-flex ga-1 align-center">
          <v-btn icon="mdi-dots-horizontal" size="small" variant="text" />
          <v-btn icon="mdi-close" size="small" variant="text" />
          <v-btn
            v-if="post.isAuthor"
            size="small"
            variant="text"
            icon="mdi-pencil-outline"
            @click="emit('editPost', post)"
          />
          <v-btn
            v-if="post.isAuthor"
            size="small"
            variant="text"
            color="error"
            icon="mdi-delete-outline"
            @click="emit('deletePost', post)"
          />
        </div>
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
        <BlogReactionSummary :reactions="post.reactions || []" />
      </div>

      <BlogPostActionsBar
        :comments-count="commentsCount"
        :shares-count="post.sharesCount || 0"
        @like="emit('like', post)"
        @comment="emit('comment', post)"
        @share="emit('share', post)"
      />
    </v-card-text>

    <v-card-text class="pt-1">
      <BlogCommentComposer
        :mode="replyTo ? 'reply' : 'comment'"
        :placeholder="replyTo ? 'Votre réponse…' : 'Ajouter un commentaire…'"
        @submit="submitComment"
        @cancel="replyTo = null"
      />
    </v-card-text>

    <v-card-text v-if="post.comments?.length" class="pt-0">
      <BlogCommentThread
        :comments="post.comments"
        @reply="replyTo = $event"
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

.post-content {
  font-size: 1.45rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  text-align: right;
}
</style>
