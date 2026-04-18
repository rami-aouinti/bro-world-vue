<script setup lang="ts">
import type { SessionUser } from '~/types/session'

type NewPostPayload = {
  title: string
  content: string
  youtubeUrl?: string
  imageUrl?: string
  videoUrl?: string
  coverImage?: string
  tags?: string[]
  images?: string[]
  mediaFiles?: File[]
  mediaType?: 'image' | 'video'
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    disabled?: boolean
    open?: boolean
    placeholder?: string
  }>(),
  {
    disabled: false,
    open: false,
    placeholder: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:open': [value: boolean]
  submit: [payload: NewPostPayload]
}>()

const content = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})
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

const isPostDisabled = computed(
  () => props.disabled || !props.modelValue.trim() || !title.value.trim(),
)
const title = ref('')
const tagsInput = ref('')
const imageGalleryInput = ref('')
const youtubeUrl = ref('')
const imageUrl = ref('')
const videoUrl = ref('')
const coverImage = ref('')
const mediaFiles = ref<File[]>([])
const mediaType = ref<'image' | 'video'>('image')

function parseCsv(input: string): string[] {
  return input
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function closeDialog() {
  emit('update:open', false)
}

function onSubmit() {
  if (isPostDisabled.value) {
    return
  }

  emit('submit', {
    title: title.value.trim(),
    content: props.modelValue.trim(),
    youtubeUrl: youtubeUrl.value.trim() || undefined,
    imageUrl: imageUrl.value.trim() || undefined,
    videoUrl: videoUrl.value.trim() || undefined,
    coverImage: coverImage.value.trim() || undefined,
    tags: parseCsv(tagsInput.value),
    images: parseCsv(imageGalleryInput.value),
    mediaFiles: mediaFiles.value,
    mediaType: mediaType.value,
  })
  title.value = ''
  tagsInput.value = ''
  imageGalleryInput.value = ''
  youtubeUrl.value = ''
  imageUrl.value = ''
  videoUrl.value = ''
  coverImage.value = ''
  mediaFiles.value = []
  mediaType.value = 'image'
  emit('update:modelValue', '')
}
</script>

<template>
  <v-dialog
    :model-value="open"
    max-width="640"
    @update:model-value="emit('update:open', $event)"
  >
    <v-card
      class="new-post-dialog"
      :class="{ 'new-post-dialog--light': isLightTheme }"
      rounded="xl"
    >
      <v-card-title
        class="py-4 d-flex align-center justify-center position-relative"
      >
        <span class="new-post-dialog__title text-h6">{{
          t('blog.newPost.createTitle')
        }}</span>
        <v-btn
          icon="mdi-close"
          :aria-label="t('common.close')"
          variant="text"
          size="small"
          class="position-absolute"
          style="right: 12px"
          @click="closeDialog"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4 d-flex flex-column ga-4">
        <div class="d-flex align-center ga-3">
          <v-avatar size="44" color="grey-darken-2">
            <v-img
              v-if="userAvatar"
              :src="userAvatar"
              :alt="`${userDisplayName} avatar`"
            />
            <v-icon v-else icon="mdi-account" />
          </v-avatar>

          <div class="d-flex flex-column ga-1">
            <span class="font-weight-bold">{{ userDisplayName }}</span>
            <BlogNewPostAudienceChip :disabled="disabled" />
          </div>
        </div>

        <v-textarea
          v-model="content"
          :disabled="disabled"
          :placeholder="resolvedPlaceholder"
          auto-grow
          rows="6"
          variant="plain"
          hide-details
          class="new-post-dialog__textarea"
        />
        <v-text-field
          v-model="title"
          :disabled="disabled"
          label="Titre"
          variant="outlined"
          hide-details
        />
        <v-text-field
          v-model="tagsInput"
          :disabled="disabled"
          label="Tags (séparés par des virgules)"
          variant="outlined"
          hide-details
        />
        <v-text-field
          v-model="youtubeUrl"
          :disabled="disabled"
          label="YouTube URL (optionnel)"
          variant="outlined"
          hide-details
        />
        <v-text-field
          v-model="imageUrl"
          :disabled="disabled"
          label="Image URL (optionnel)"
          variant="outlined"
          hide-details
        />
        <v-text-field
          v-model="videoUrl"
          :disabled="disabled"
          label="Video URL (optionnel)"
          variant="outlined"
          hide-details
        />
        <v-text-field
          v-model="coverImage"
          :disabled="disabled"
          label="Cover image URL (optionnel)"
          variant="outlined"
          hide-details
        />
        <v-text-field
          v-model="imageGalleryInput"
          :disabled="disabled"
          label="Images galerie (URLs, séparées par virgules)"
          variant="outlined"
          hide-details
        />
        <v-file-input
          v-model="mediaFiles"
          :disabled="disabled"
          label="Upload image / video"
          multiple
          chips
          accept="image/*,video/*"
          variant="outlined"
          hide-details
        />
        <v-select
          v-model="mediaType"
          :disabled="disabled"
          :items="['image', 'video']"
          label="Media type upload"
          variant="outlined"
          hide-details
        />

        <BlogNewPostAddToPostRow :disabled="disabled" />
      </v-card-text>

      <v-card-actions class="new-post-actions px-6 pb-6">
        <v-btn
          class="new-post-submit"
          block
          color="primary"
          size="large"
          :disabled="isPostDisabled"
          @click="onSubmit"
        >
          {{ t('blog.newPost.postAction') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.new-post-dialog {
  --dialog-bg: #1d1f24;
  --dialog-border: rgba(255, 255, 255, 0.16);
  --dialog-radius: 18px;
  --dialog-title-color: rgba(255, 255, 255, 0.96);
  --dialog-placeholder: rgba(255, 255, 255, 0.52);
  --dialog-focus: rgba(255, 255, 255, 0.22);
  --dialog-submit-hover: rgba(255, 255, 255, 0.08);

  background: var(--dialog-bg);
  border: 1px solid var(--dialog-border);
  border-radius: var(--dialog-radius) !important;
}

.new-post-dialog--light {
  --dialog-bg: #ffffff;
  --dialog-border: rgba(15, 23, 42, 0.1);
  --dialog-title-color: rgba(15, 23, 42, 0.94);
  --dialog-placeholder: rgba(15, 23, 42, 0.42);
  --dialog-focus: rgba(37, 99, 235, 0.24);
}

.new-post-dialog__title {
  color: var(--dialog-title-color);
  font-weight: 800;
}

:deep(.new-post-dialog__textarea textarea::placeholder) {
  color: var(--dialog-placeholder);
  font-weight: 500;
}

.new-post-actions {
  padding-top: 4px;
}

.new-post-submit {
  border-radius: 16px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.new-post-submit:hover:not(.v-btn--disabled),
.new-post-submit:focus-visible:not(.v-btn--disabled) {
  box-shadow: inset 0 0 0 1px var(--dialog-focus);
  filter: brightness(1.03);
}
</style>
