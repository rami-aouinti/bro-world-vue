<script setup lang="ts">
import type { SessionUser } from '~/types/session'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    placeholder?: string
  }>(),
  {
    disabled: false,
    placeholder: '',
  },
)

const emit = defineEmits<{
  open: []
}>()
const theme = useTheme()
const { t } = useI18n()
const { user } = useUserSession()
const isLightTheme = computed(() => !theme.current.value.dark)
const sessionUser = computed(() => user.value as SessionUser | null)
const userDisplayName = computed(() => {
  const fullName = [sessionUser.value?.firstName, sessionUser.value?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
  return (
    fullName || sessionUser.value?.username || t('blog.common.userFallback')
  )
})
const userAvatar = computed(() => sessionUser.value?.photo || null)
const resolvedPlaceholder = computed(
  () =>
    props.placeholder ||
    t('blog.newPost.placeholder', { name: userDisplayName.value }),
)

const actions = [
  {
    icon: 'mdi-video-wireless',
    colorClass: 'new-post-action--live',
    label: t('blog.newPost.actions.liveVideo'),
  },
  {
    icon: 'mdi-image-multiple',
    colorClass: 'new-post-action--media',
    label: t('blog.newPost.actions.photoVideo'),
  },
  {
    icon: 'mdi-emoticon-happy-outline',
    colorClass: 'new-post-action--feeling',
    label: t('blog.newPost.actions.feelingActivity'),
  },
  {
    icon: 'mdi-tag-outline',
    colorClass: 'new-post-action--tag',
    label: t('blog.newPost.actions.tag'),
  },
  {
    icon: 'mdi-gif',
    colorClass: 'new-post-action--gif',
    label: t('blog.newPost.actions.gif'),
  },
]

function openComposer() {
  if (props.disabled) {
    return
  }

  emit('open')
}
</script>

<template>
  <v-sheet
    rounded="xl"
    class="new-post-launcher px-4 py-3 d-flex align-center ga-3"
    :class="{ 'new-post-launcher--light': isLightTheme }"
  >
    <v-avatar size="40" color="grey-darken-2">
      <v-img v-if="userAvatar" :src="userAvatar" />
      <v-icon v-else icon="mdi-account" />
    </v-avatar>

    <v-btn
      class="new-post-pill flex-grow-1 justify-start text-none"
      variant="tonal"
      rounded="pill"
      :disabled="disabled"
      @click="openComposer"
    >
      <span class="new-post-pill__placeholder">{{ resolvedPlaceholder }}</span>
    </v-btn>

    <div class="d-flex ga-1">
      <v-btn
        v-for="action in actions"
        :key="action.label"
        :icon="action.icon"
        variant="text"
        size="small"
        :disabled="disabled"
        :class="action.colorClass"
        @click="openComposer"
      />
    </div>
  </v-sheet>
</template>

<style scoped lang="scss">
.new-post-launcher {
  --new-post-bg: #1d1f24;
  --new-post-border: rgba(255, 255, 255, 0.14);
  --new-post-pill-bg: #2a2d33;
  --new-post-radius: 18px;
  --new-post-focus: rgba(255, 255, 255, 0.22);
  --new-post-placeholder: rgba(255, 255, 255, 0.68);
  --icon-live: #f3425f;
  --icon-media: #45bd62;
  --icon-feeling: #f7b928;
  --icon-tag: #4b8ef7;
  --icon-gif: #31d7e8;

  background: var(--new-post-bg);
  border: 1px solid var(--new-post-border);
  border-radius: var(--new-post-radius) !important;
}

.new-post-launcher--light {
  --new-post-bg: #ffffff;
  --new-post-border: rgba(15, 23, 42, 0.08);
  --new-post-pill-bg: #f1f5f9;
  --new-post-focus: rgba(37, 99, 235, 0.22);
  --new-post-placeholder: rgba(15, 23, 42, 0.62);
}

.new-post-pill {
  background: var(--new-post-pill-bg);
  transition: background-color 0.2s ease;
}

.new-post-pill:hover:not(.v-btn--disabled),
.new-post-pill:focus-visible:not(.v-btn--disabled) {
  background: color-mix(in srgb, var(--new-post-pill-bg), white 7%);
  box-shadow: inset 0 0 0 1px var(--new-post-focus);
}

.new-post-pill__placeholder {
  color: var(--new-post-placeholder);
  font-weight: 500;
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
