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
  <v-card rounded="lg">
    <v-card-item>
      <v-card-title>{{ post.author || 'Auteur' }}</v-card-title>
      <v-card-subtitle>{{ formattedDate }}</v-card-subtitle>

      <template #append>
        <div class="d-flex ga-1">
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

    <v-card-text class="pt-0">
      <p class="text-body-1">{{ post.content }}</p>

      <v-img
        v-if="post.mediaUrl"
        :src="post.mediaUrl"
        rounded="lg"
        cover
        max-height="360"
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
      <BlogReactionSummary :reactions="post.reactions || []" />
      <BlogPostActionsBar
        @like="emit('like', post)"
        @comment="emit('comment', post)"
        @share="emit('share', post)"
      />
    </v-card-text>

    <v-card-text class="pt-0">
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
