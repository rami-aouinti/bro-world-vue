<script setup lang="ts">
import { formatRelativeTime } from '../../utils/formatRelativeTime'

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

const props = withDefaults(
  defineProps<{
    comments?: BlogComment[]
    level?: number
    canInteract?: boolean
    activeReplyId?: string | number | null
    reactionTypes?: ReactionType[]
  }>(),
  {
    comments: () => [],
    level: 0,
    canInteract: true,
    activeReplyId: null,
    reactionTypes: () => [],
  },
)

const emit = defineEmits<{
  reply: [comment: BlogComment]
  submitReply: [payload: { comment: BlogComment; content: string }]
  react: [payload: { comment: BlogComment; code: string }]
  edit: [comment: BlogComment]
  delete: [comment: BlogComment]
}>()
const { locale, t } = useI18n()

const reactionMenuById = ref<Record<string, boolean>>({})

const normalizedReactionTypes = computed(() =>
  props.reactionTypes.length
    ? props.reactionTypes
    : [
        { code: 'like', label: t('blog.post.reactions.like') },
        { code: 'heart', label: t('blog.post.reactions.heart') },
        { code: 'celebrate', label: t('blog.post.reactions.celebrate') },
        { code: 'laugh', label: t('blog.post.reactions.laugh') },
        { code: 'wow', label: t('blog.post.reactions.wow') },
        { code: 'sad', label: t('blog.post.reactions.sad') },
        { code: 'angry', label: t('blog.post.reactions.angry') },
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
    .filter(
      (reaction) =>
        typeof reaction.type === 'string' && reaction.type.length > 0,
    )
    .map((reaction) => ({
      type: reaction.type as string,
      count: reaction.count,
    }))
}

function pickReaction(comment: BlogComment, code: string) {
  if (!props.canInteract) {
    return
  }

  emit('react', { comment, code })
  reactionMenuById.value[commentKey(comment)] = false
}

function formattedDate(comment: BlogComment) {
  return formatRelativeTime(
    locale.value,
    comment.createdAt,
    t('blog.comment.now'),
  )
}

function authorProfilePath(comment: BlogComment) {
  const username = comment.author?.username?.trim()
  return username ? `/user/${encodeURIComponent(username)}/profile` : null
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
        <NuxtLink
          v-if="authorProfilePath(comment)"
          :to="authorProfilePath(comment)!"
          class="comment-author-link"
        >
          <v-avatar size="34" color="grey-darken-2">
            <v-img
              v-if="comment.author?.photo"
              :src="comment.author.photo"
              :alt="`${comment.author?.displayName || t('blog.common.userFallback')} avatar`"
            />
            <v-icon v-else size="18" icon="mdi-account" />
          </v-avatar>
        </NuxtLink>
        <div v-else class="comment-author-link">
          <v-avatar size="34" color="grey-darken-2">
            <v-img
              v-if="comment.author?.photo"
              :src="comment.author.photo"
              :alt="`${comment.author?.displayName || t('blog.common.userFallback')} avatar`"
            />
            <v-icon v-else size="18" icon="mdi-account" />
          </v-avatar>
        </div>

        <div class="comment-body">
          <div class="comment-bubble">
            <div class="d-flex align-start justify-space-between ga-2">
              <div>
                <NuxtLink
                  v-if="authorProfilePath(comment)"
                  :to="authorProfilePath(comment)!"
                  class="text-subtitle-2 font-weight-bold comment-author-link"
                >
                  {{
                    comment.author?.displayName || t('blog.common.userFallback')
                  }}
                </NuxtLink>
                <span
                  v-else
                  class="text-subtitle-2 font-weight-bold comment-author-link"
                >
                  {{
                    comment.author?.displayName || t('blog.common.userFallback')
                  }}
                </span>
                <div class="text-caption text-medium-emphasis">
                  {{ formattedDate(comment) }}
                </div>
              </div>
              <v-menu v-if="comment.isAuthor" location="bottom end">
                <template #activator="{ props: menuProps }">
                  <v-btn
                    v-bind="menuProps"
                    size="x-small"
                    variant="text"
                    icon="mdi-dots-horizontal"
                    :aria-label="t('common.edit')"
                  />
                </template>

                <v-list density="compact" min-width="140">
                  <v-list-item
                    prepend-icon="mdi-pencil-outline"
                    :title="t('blog.post.menu.edit')"
                    @click="emit('edit', comment)"
                  />
                  <v-list-item
                    prepend-icon="mdi-delete-outline"
                    :title="t('blog.post.menu.delete')"
                    base-color="error"
                    @click="emit('delete', comment)"
                  />
                </v-list>
              </v-menu>
            </div>
            <p class="mb-0 text-body-1">{{ comment.content }}</p>
          </div>

          <div class="comment-actions text-medium-emphasis">
            <v-menu
              v-model="reactionMenuById[commentKey(comment)]"
              :open-on-hover="canInteract"
              open-delay="120"
              location="top"
              :disabled="!canInteract"
            >
              <template #activator="{ props: menuProps }">
                <button
                  v-bind="menuProps"
                  type="button"
                  :disabled="!canInteract"
                  @click="pickReaction(comment, 'like')"
                >
                  {{ t('blog.post.actions.like') }}
                </button>
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

            <button
              type="button"
              :disabled="!canInteract"
              @click="emit('reply', comment)"
            >
              {{ t('blog.comment.actions.reply') }}
            </button>
          </div>

          <div class="mt-1">
            <BlogReactionSummary :reactions="normalizedReactions(comment)" />
          </div>

          <div v-if="activeReplyId === comment.id" class="reply-composer">
            <BlogCommentComposer
              mode="reply"
              :disabled="!canInteract"
              :placeholder="t('blog.comment.placeholders.reply')"
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
          :can-interact="canInteract"
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

.comment-actions button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
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

.comment-author-link {
  text-decoration: none;
  color: inherit;
}
</style>
