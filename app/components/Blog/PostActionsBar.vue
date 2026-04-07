<script setup lang="ts">
type ReactionType = {
  code: string
  label: string
}

const props = withDefaults(defineProps<{
  commentsCount?: number
  sharesCount?: number
  reactionTypes?: ReactionType[]
}>(), {
  commentsCount: 0,
  sharesCount: 0,
  reactionTypes: () => [],
})
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

function onPickReaction(code: string) {
  emit('react', code)
  reactionMenu.value = false
}
</script>

<template>
  <div class="post-actions-wrap">
    <div v-if="commentsCount > 0 || sharesCount > 0" class="post-stats text-medium-emphasis">
      <span v-if="commentsCount > 0" class="stat-item">
        <v-icon size="16" icon="mdi-comment-outline" />
        {{ commentsCount }}
      </span>
      <span v-if="sharesCount > 0" class="stat-item">
        <v-icon size="16" icon="mdi-share-outline" />
        {{ sharesCount }}
      </span>
    </div>

    <v-divider class="my-2" />

    <div class="post-actions d-flex ga-2">
      <v-menu
        v-model="reactionMenu"
        :open-on-hover="true"
        open-delay="120"
        location="top"
      >
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            class="action-btn"
            variant="text"
            prepend-icon="mdi-thumb-up-outline"
            @click.stop="emit('like')"
          >
            {{ t('blog.post.actions.like') }}
          </v-btn>
        </template>

        <div class="reaction-picker">
          <button
            v-for="item in normalizedReactionTypes"
            :key="item.code"
            type="button"
            class="reaction-choice"
            :title="item.label"
            @click="onPickReaction(item.code)"
          >
            {{ iconMap[item.code.toLowerCase()] ?? '👍' }}
          </button>
        </div>
      </v-menu>

      <v-btn class="action-btn" variant="text" prepend-icon="mdi-comment-outline" @click="emit('comment')">
        {{ t('blog.post.actions.comment') }}
      </v-btn>
      <v-btn class="action-btn" variant="text" prepend-icon="mdi-share-outline" @click="emit('share')">
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
</style>
