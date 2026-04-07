<script setup lang="ts">
defineOptions({
  name: 'BlogCommentThread',
})

type BlogReaction = {
  type: string | null
  count: number
  isAuthor?: boolean
}

type BlogComment = {
  id: string | number
  content: string
  createdAt: string | null
  isAuthor: boolean
  author?: {
    firstName: string | null
    lastName: string | null
    username: string | null
    displayName: string
    photo: string | null
  } | null
  children?: BlogComment[]
  reactions?: BlogReaction[]
}

type ReactionType = {
  code: string
  label: string
}

const props = withDefaults(defineProps<{
  comments?: BlogComment[]
  level?: number
  activeReplyId?: string | number | null
  reactionTypes?: ReactionType[]
}>(), {
  comments: () => [],
  level: 0,
  activeReplyId: null,
  reactionTypes: () => [],
})

const emit = defineEmits<{
  reply: [comment: BlogComment]
  submitReply: [payload: { comment: BlogComment, content: string }]
  react: [payload: { comment: BlogComment, code: string }]
  edit: [comment: BlogComment]
  delete: [comment: BlogComment]
}>()

const reactionMenuById = ref<Record<string, boolean>>({})

const normalizedReactionTypes = computed(() =>
  props.reactionTypes.length
    ? props.reactionTypes
    : [
        { code: 'like', label: 'Like' },
        { code: 'heart', label: 'Love' },
        { code: 'celebrate', label: 'Celebrate' },
        { code: 'laugh', label: 'Haha' },
        { code: 'wow', label: 'Wow' },
        { code: 'sad', label: 'Sad' },
        { code: 'angry', label: 'Angry' },
      ],
)

const iconMap: Record<string, string> = {
  like: '👍',
  heart: '❤️',
  celebrate: '🥳',
  laugh: '😄',
  wow: '😮',
  sad: '😢',
  angry: '😡',
}

function commentKey(comment: BlogComment) {
  return String(comment.id)
}

function normalizedReactions(comment: BlogComment) {
  return (comment.reactions || [])
    .filter((reaction) => typeof reaction.type === 'string' && reaction.type.length > 0)
    .map((reaction) => ({
      type: reaction.type as string,
      count: reaction.count,
    }))
}

function pickReaction(comment: BlogComment, code: string) {
  emit('react', { comment, code })
  reactionMenuById.value[commentKey(comment)] = false
}
</script>

<template>
  <div class="d-flex flex-column ga-3">
    <div
      v-for="comment in comments"
      :key="comment.id"
      class="comment-item"
      :class="{ 'nested-comment': level > 0 }"
    >
      <div class="d-flex ga-2 align-start">
        <v-avatar size="34" color="grey-darken-2">
          <v-img v-if="comment.author?.photo" :src="comment.author.photo" />
          <v-icon v-else size="18" icon="mdi-account" />
        </v-avatar>

        <div class="comment-body">
          <div class="comment-bubble">
            <div class="d-flex align-start justify-space-between ga-2">
              <div class="text-subtitle-2 font-weight-bold">{{ comment.author?.displayName || 'Utilisateur' }}</div>
              <div v-if="comment.isAuthor" class="d-flex ga-1">
                <v-btn size="x-small" variant="text" icon="mdi-pencil-outline" @click="emit('edit', comment)" />
                <v-btn size="x-small" variant="text" color="error" icon="mdi-delete-outline" @click="emit('delete', comment)" />
              </div>
            </div>
            <p class="mb-0 text-body-1">{{ comment.content }}</p>
          </div>

          <div class="comment-actions text-medium-emphasis">
            <span>{{ comment.createdAt ?? 'Maintenant' }}</span>

            <v-menu
              v-model="reactionMenuById[commentKey(comment)]"
              :open-on-hover="true"
              open-delay="120"
              location="top"
            >
              <template #activator="{ props: menuProps }">
                <button v-bind="menuProps" type="button" @click="pickReaction(comment, 'like')">Gefällt mir</button>
              </template>

              <div class="reaction-picker">
                <button
                  v-for="item in normalizedReactionTypes"
                  :key="item.code"
                  type="button"
                  class="reaction-choice"
                  :title="item.label"
                  @click="pickReaction(comment, item.code)"
                >
                  {{ iconMap[item.code.toLowerCase()] ?? '👍' }}
                </button>
              </div>
            </v-menu>

            <button type="button" @click="emit('reply', comment)">Répondre</button>
          </div>

          <div class="mt-1">
            <BlogReactionSummary :reactions="normalizedReactions(comment)" />
          </div>

          <div v-if="activeReplyId === comment.id" class="reply-composer">
            <BlogCommentComposer
              mode="reply"
              placeholder="Votre réponse…"
              @submit="emit('submitReply', { comment, content: $event })"
              @cancel="emit('reply', comment)"
            />
          </div>
        </div>
      </div>

      <div v-if="comment.children?.length" class="children-wrap">
        <BlogCommentThread
          :comments="comment.children"
          :level="level + 1"
          :active-reply-id="activeReplyId"
          :reaction-types="reactionTypes"
          @reply="emit('reply', $event)"
          @submit-reply="emit('submitReply', $event)"
          @react="emit('react', $event)"
          @edit="emit('edit', $event)"
          @delete="emit('delete', $event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-item.nested-comment {
  margin-left: 1.6rem;
  padding-left: 0.8rem;
  border-left: 2px solid rgba(255, 255, 255, 0.12);
}

.comment-body {
  flex: 1;
}

.comment-bubble {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 0.6rem 0.9rem;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-top: 0.35rem;
  padding-left: 0.15rem;
  font-size: 0.95rem;
}

.comment-actions button {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  font-weight: 600;
}

.children-wrap {
  margin-top: 0.45rem;
}

.reply-composer {
  margin-top: 0.5rem;
}

.reaction-picker {
  display: flex;
  gap: 0.35rem;
  padding: 0.35rem 0.5rem;
  border-radius: 999px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.32);
}

.reaction-choice {
  border: none;
  background: transparent;
  font-size: 1.45rem;
  cursor: pointer;
  line-height: 1;
}

.reaction-choice:hover {
  transform: translateY(-2px) scale(1.08);
}
</style>
