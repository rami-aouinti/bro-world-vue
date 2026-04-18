<script setup lang="ts">
const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)
const emit = defineEmits<{
  action: [action: 'live' | 'media' | 'feeling' | 'tag' | 'youtube']
}>()
const theme = useTheme()
const isLightTheme = computed(() => !theme.current.value.dark)

const actions = [
  {
    key: 'live' as const,
    icon: 'mdi-video-wireless',
    colorClass: 'new-post-action--live',
    label: t('blog.newPost.actions.liveVideo'),
  },
  {
    key: 'media' as const,
    icon: 'mdi-image-multiple',
    colorClass: 'new-post-action--media',
    label: t('blog.newPost.actions.photoVideo'),
  },
  {
    key: 'feeling' as const,
    icon: 'mdi-emoticon-happy-outline',
    colorClass: 'new-post-action--feeling',
    label: t('blog.newPost.actions.feelingActivity'),
  },
  {
    key: 'tag' as const,
    icon: 'mdi-tag-outline',
    colorClass: 'new-post-action--tag',
    label: t('blog.newPost.actions.tag'),
  },
  {
    key: 'youtube' as const,
    icon: 'mdi-youtube',
    colorClass: 'new-post-action--gif',
    label: 'YouTube link',
  },
]
</script>

<template>
  <v-sheet
    class="new-post-actions px-3 py-2 d-flex align-center justify-space-between ga-2"
    :class="{ 'new-post-actions--light': isLightTheme }"
  >
    <span class="new-post-actions__label text-body-2">{{
      t('blog.newPost.addToPost')
    }}</span>

    <div class="d-flex ga-1">
      <v-btn
        v-for="action in actions"
        :key="action.label"
        :icon="action.icon"
        :aria-label="action.label"
        :disabled="props.disabled"
        variant="text"
        size="small"
        :class="action.colorClass"
        @click="emit('action', action.key)"
      />
    </div>
  </v-sheet>
</template>

<style scoped lang="scss">
.new-post-actions {
  --actions-bg: #1d1f24;
  --actions-border: rgba(255, 255, 255, 0.14);
  --actions-radius: 16px;
  --actions-label: rgba(255, 255, 255, 0.78);
  --icon-live: #f3425f;
  --icon-media: #45bd62;
  --icon-feeling: #f7b928;
  --icon-tag: #4b8ef7;
  --icon-gif: #31d7e8;

  background: var(--actions-bg);
  border: 1px solid var(--actions-border);
  border-radius: var(--actions-radius) !important;
}

.new-post-actions--light {
  --actions-bg: #ffffff;
  --actions-border: rgba(15, 23, 42, 0.08);
  --actions-label: rgba(15, 23, 42, 0.68);
}

.new-post-actions__label {
  color: var(--actions-label);
  font-weight: 600;
}

.new-post-action--live {
  color: var(--icon-live);
}

.new-post-action--media {
  color: var(--icon-media);
}

.new-post-action--feeling {
  color: var(--icon-feeling);
}

.new-post-action--tag {
  color: var(--icon-tag);
}

.new-post-action--gif {
  color: var(--icon-gif);
}
</style>
