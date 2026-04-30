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
const modalState = ref<null | 'tag' | 'youtube' | 'camera' | 'media'>(null)
const cameraInput = ref<HTMLInputElement | null>(null)
const mediaInput = ref<HTMLInputElement | null>(null)
const actionModalOpen = computed({
  get: () => Boolean(modalState.value),
  set: (value: boolean) => {
    if (!value) {
      modalState.value = null
    }
  },
})
const actionModalTitle = computed(() => {
  if (modalState.value === 'tag') return t('blog.newPost.modals.tag.title')
  if (modalState.value === 'youtube')
    return t('blog.newPost.modals.youtube.title')
  if (modalState.value === 'camera')
    return t('blog.newPost.modals.camera.title')
  if (modalState.value === 'media') return t('blog.newPost.modals.media.title')
  return t('blog.newPost.createTitle')
})

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function parseCsv(input: string): string[] {
  return input
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function openActionModal(
  action: 'live' | 'media' | 'feeling' | 'tag' | 'youtube',
) {
  if (action === 'tag') {
    modalState.value = 'tag'
    return
  }

  if (action === 'youtube') {
    modalState.value = 'youtube'
    return
  }

  if (action === 'live') {
    modalState.value = 'camera'
    nextTick(() => cameraInput.value?.click())
    return
  }

  if (action === 'media') {
    modalState.value = 'media'
  }
}

function onCameraFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  if (files.length > 0) {
    mediaType.value = 'video'
    mediaFiles.value = [...mediaFiles.value, ...files]
  }
  target.value = ''
}

function onMediaFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  if (files.length > 0) {
    const hasVideo = files.some((file) => file.type.startsWith('video/'))
    mediaType.value = hasVideo ? 'video' : 'image'
    mediaFiles.value = [...mediaFiles.value, ...files]
  }
  target.value = ''
}

function onSubmit() {
  if (isPostDisabled.value) {
    return
  }

  const youtube = youtubeUrl.value.trim()
  const image = imageUrl.value.trim()
  const video = videoUrl.value.trim()
  const resolvedContent =
    [youtube, image, video].find((entry) => entry && isValidHttpUrl(entry)) ||
    props.modelValue.trim()

  emit('submit', {
    title: title.value.trim(),
    content: resolvedContent,
    youtubeUrl: youtube || undefined,
    imageUrl: image || undefined,
    videoUrl: video || undefined,
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
  <AppModal
    :model-value="open"
    :title="t('blog.newPost.createTitle')"
    :max-width="640"
    @update:model-value="emit('update:open', $event)"
  >
    <v-card
      class="new-post-dialog"
      :class="{ 'new-post-dialog--light': isLightTheme }"
      rounded="xl"
    >
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
        <v-text-field
          v-model="title"
          :disabled="disabled"
          label="Titre"
          variant="outlined"
          hide-details
        />
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
        <BlogNewPostAddToPostRow
          :disabled="disabled"
          @action="openActionModal"
        />
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

      <input
        ref="cameraInput"
        type="file"
        accept="video/*"
        capture="environment"
        class="d-none"
        @change="onCameraFileChange"
      />
      <input
        ref="mediaInput"
        type="file"
        accept="image/*,video/*"
        multiple
        class="d-none"
        @change="onMediaFileChange"
      />
    </v-card>
  </AppModal>

  <AppModal
    v-model="actionModalOpen"
    :title="actionModalTitle"
    :max-width="520"
  >
    <v-card v-if="modalState === 'tag'" rounded="lg">
      <v-card-text>
        <v-text-field
          v-model="tagsInput"
          :label="t('blog.newPost.modals.tag.input')"
          variant="outlined"
          hide-details
        />
      </v-card-text>
      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="modalState = null">{{
          t('common.close')
        }}</v-btn>
      </v-card-actions>
    </v-card>

    <v-card v-else-if="modalState === 'youtube'" rounded="lg">
      <v-card-text>
        <v-text-field
          v-model="youtubeUrl"
          label="YouTube URL"
          variant="outlined"
          hide-details
        />
      </v-card-text>
      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="modalState = null">{{
          t('common.close')
        }}</v-btn>
      </v-card-actions>
    </v-card>

    <v-card v-else-if="modalState === 'camera'" rounded="lg">
      <v-card-text>
        {{ t('blog.newPost.modals.camera.description') }}
      </v-card-text>
      <v-card-actions class="px-4 pb-4">
        <v-btn color="primary" variant="tonal" @click="cameraInput?.click()">
          {{ t('blog.newPost.modals.camera.open') }}
        </v-btn>
        <v-spacer />
        <v-btn variant="text" @click="modalState = null">{{
          t('common.close')
        }}</v-btn>
      </v-card-actions>
    </v-card>

    <v-card v-else-if="modalState === 'media'" rounded="lg">
      <v-card-text class="d-flex flex-column ga-3">
        <v-text-field
          v-model="imageUrl"
          :label="t('blog.newPost.modals.media.imageUrl')"
          variant="outlined"
          hide-details
        />
        <v-text-field
          v-model="videoUrl"
          :label="t('blog.newPost.modals.media.videoUrl')"
          variant="outlined"
          hide-details
        />
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-paperclip"
          @click="mediaInput?.click()"
        >
          {{ t('blog.newPost.modals.media.upload') }}
        </v-btn>
        <v-file-input
          v-model="mediaFiles"
          :label="t('blog.newPost.modals.media.selectedFiles')"
          multiple
          chips
          accept="image/*,video/*"
          variant="outlined"
          hide-details
        />
      </v-card-text>
      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="modalState = null">{{
          t('common.close')
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </AppModal>
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
