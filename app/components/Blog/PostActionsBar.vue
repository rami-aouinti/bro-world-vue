<script setup lang="ts">
type ReactionType = {
  code: string
  label: string
}

const props = withDefaults(
  defineProps<{
    commentsCount?: number
    sharesCount?: number
    canInteract?: boolean
    reactionTypes?: ReactionType[]
    currentReactionCode?: string | null
  }>(),
  {
    commentsCount: 0,
    sharesCount: 0,
    canInteract: true,
    reactionTypes: () => [],
    currentReactionCode: null,
  },
)
const { t } = useI18n()

const emit = defineEmits<{
  like: []
  react: [code: string]
  comment: []
  share: []
}>()

const reactionMenu = ref(false)
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

const normalizedCurrentReactionCode = computed(() => {
  const code = props.currentReactionCode?.toLowerCase().trim()
  return code?.length ? code : null
})

const currentReactionEmoji = computed(
  () => iconMap[normalizedCurrentReactionCode.value ?? ''] ?? null,
)

const currentReactionLabel = computed(() => {
  if (!normalizedCurrentReactionCode.value) {
    return t('blog.post.actions.like')
  }

  const match = normalizedReactionTypes.value.find(
    (entry) => entry.code.toLowerCase() === normalizedCurrentReactionCode.value,
  )

  return match?.label ?? t('blog.post.actions.like')
})

function onPickReaction(code: string) {
  if (!props.canInteract) {
    return
  }

  emit('react', code)
  reactionMenu.value = false
}
</script>

<template>
  <div class="post-actions-wrap">
    <div
      v-if="commentsCount > 0 || sharesCount > 0"
      class="post-stats text-medium-emphasis"
    >
      <button
        v-if="commentsCount > 0"
        type="button"
        class="stat-item stat-item--button"
        :disabled="!canInteract"
        @click="emit('comment')"
      >
        <v-icon size="16" icon="mdi-comment-outline" />
        {{ commentsCount }}
      </button>
      <span v-if="sharesCount > 0" class="stat-item">
        <v-icon size="16" icon="mdi-share-outline" />
        {{ sharesCount }}
      </span>
    </div>

    <v-divider class="my-2" />

    <div class="post-actions d-flex ga-2">
      <v-menu
        v-model="reactionMenu"
        :open-on-hover="canInteract"
        open-delay="120"
        location="top"
        :disabled="!canInteract"
      >
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            class="action-btn"
            variant="text"
            :disabled="!canInteract"
            @click.stop="emit('like')"
          >
            <span class="d-inline-flex align-center ga-2">
              <v-icon
                v-if="!currentReactionEmoji"
                size="18"
                icon="mdi-thumb-up-outline"
              />
              <span v-else class="reaction-btn-emoji">{{ currentReactionEmoji }}</span>
              <span>{{ currentReactionLabel }}</span>
            </span>
          </v-btn>
        </template>

        <div class="reaction-picker">
          <button
            v-for="item in normalizedReactionTypes"
            :key="item.code"
            type="button"
            class="reaction-choice"
            :class="{
              'reaction-choice--selected':
                normalizedCurrentReactionCode === item.code.toLowerCase(),
            }"
            :title="item.label"
            @click="onPickReaction(item.code)"
          >
            {{ iconMap[item.code.toLowerCase()] ?? '👍' }}
          </button>
        </div>
      </v-menu>

      <v-btn
        class="action-btn"
        variant="text"
        prepend-icon="mdi-comment-outline"
        :disabled="!canInteract"
        @click="emit('comment')"
      >
        {{ t('blog.post.actions.comment') }}
      </v-btn>
      <v-btn
        class="action-btn"
        variant="text"
        prepend-icon="mdi-share-outline"
        :disabled="!canInteract"
        @click="emit('share')"
      >
        {{ t('blog.post.actions.share') }}
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.post-stats {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  font-size: 0.95rem;
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.stat-item--button {
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.stat-item--button:disabled {
  opacity: 0.6;
  cursor: default;
}

.action-btn {
  flex: 1;
  justify-content: center;
  color: rgb(var(--v-theme-on-surface));
  text-transform: none;
  font-weight: 600;
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
  font-size: 1.65rem;
  cursor: pointer;
  line-height: 1;
  transition: transform 0.14s ease;
}

.reaction-choice:hover {
  transform: translateY(-3px) scale(1.1);
}

.reaction-choice--selected {
  transform: scale(1.2);
  filter: drop-shadow(0 0 8px rgba(var(--v-theme-primary), 0.6));
}

.reaction-btn-emoji {
  font-size: 1rem;
  line-height: 1;
}
</style>
