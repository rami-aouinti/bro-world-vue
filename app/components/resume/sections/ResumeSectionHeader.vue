<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'

const props = defineProps<{ resume: ResumeApiItem; template?: any }>()

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_PHOTO_BYTES = 5 * 1024 * 1024

const fileInput = ref<HTMLInputElement | null>(null)
const previewPhotoUrl = ref('')
const photoError = ref('')
const isPhotoLoading = ref(false)

const initials = computed(() =>
  (props.resume.resumeInformation?.fullName || '?')
    .split(' ')
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

const photoStorageKey = computed(() => `resume-builder-photo-${props.resume.id || 'anonymous'}`)

const photoConfig = computed(() => {
  const photo = props.template?.photo ?? {}
  const position = photo.position === 'right' ? 'right' : 'left'
  const size =
    typeof photo.size === 'number'
      ? `${photo.size}px`
      : typeof photo.size === 'string' && photo.size.trim()
        ? photo.size
        : '64px'
  const allowedShapes = new Set(['circle', 'rounded', 'square', 'hex', 'blob'])
  const shape =
    typeof photo.shape === 'string' && allowedShapes.has(photo.shape)
      ? photo.shape
      : 'circle'
  const border = typeof photo.border === 'string' && photo.border.trim()
    ? photo.border
    : '2px solid var(--primary, #0f4c81)'

  return { position, size, shape, border }
})

const avatarStyle = computed(() => ({
  '--photo-size': photoConfig.value.size,
  '--photo-border': photoConfig.value.border,
}))

const currentPhotoUrl = computed(() => {
  const resumePhoto = (props.resume as ResumeApiItem & { photoUrl?: string }).photoUrl
  const apiPhoto = props.resume.resumeInformation?.photo
  return previewPhotoUrl.value || resumePhoto || apiPhoto || ''
})

function openPhotoPicker() {
  fileInput.value?.click()
}

function persistPhotoLocally(photoUrl: string) {
  if (!import.meta.client) return
  sessionStorage.setItem(photoStorageKey.value, photoUrl)
}

function restoreLocalPhoto() {
  if (!import.meta.client) return
  const cachedPhoto = sessionStorage.getItem(photoStorageKey.value)
  if (!cachedPhoto) return
  previewPhotoUrl.value = cachedPhoto
  ;(props.resume as ResumeApiItem & { photoUrl?: string }).photoUrl = cachedPhoto
}

function onPhotoSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  photoError.value = ''

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    photoError.value = 'Format invalide. Utilisez JPG, PNG ou WEBP.'
    input.value = ''
    return
  }

  if (file.size > MAX_PHOTO_BYTES) {
    photoError.value = 'Image trop volumineuse (max 5 Mo).'
    input.value = ''
    return
  }

  isPhotoLoading.value = true

  const nextPreviewUrl = URL.createObjectURL(file)
  previewPhotoUrl.value = nextPreviewUrl
  ;(props.resume as ResumeApiItem & { photoUrl?: string }).photoUrl = nextPreviewUrl
  persistPhotoLocally(nextPreviewUrl)

  isPhotoLoading.value = false
  input.value = ''
}

onMounted(() => {
  restoreLocalPhoto()
})

onBeforeUnmount(() => {
  if (previewPhotoUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewPhotoUrl.value)
  }
})
</script>

<template>
  <section class="section header" :class="`is-${photoConfig.position}`">
    <button
      class="avatar"
      :class="[
        `avatar--shape-${photoConfig.shape}`,
        { 'avatar--uploading': isPhotoLoading, 'avatar--error': Boolean(photoError), 'avatar--with-photo': Boolean(currentPhotoUrl) },
      ]"
      :style="avatarStyle"
      type="button"
      @click="openPhotoPicker"
    >
      <v-img
        v-if="currentPhotoUrl"
        :src="currentPhotoUrl"
        alt="Photo de profil"
        class="avatar-image"
        cover
      />
      <span v-else>{{ initials }}</span>
      <span class="avatar-overlay">Changer</span>
      <span class="avatar-corner-icon" aria-hidden="true">
        <v-icon icon="mdi-camera-plus" size="16" />
      </span>
      <span v-if="isPhotoLoading" class="avatar-loader">Chargement…</span>
    </button>

    <input
      ref="fileInput"
      class="photo-input"
      type="file"
      accept="image/png,image/jpeg,image/webp"
      @change="onPhotoSelected"
    >

    <div>
      <h1>{{ resume.resumeInformation?.fullName }}</h1>
      <p>{{ resume.resumeInformation?.title }}</p>
      <p v-if="photoError" class="photo-error">{{ photoError }}</p>
    </div>
  </section>
</template>

<style scoped>
.header { display:flex; gap:var(--section-space, 12px); align-items:center; padding-bottom:var(--section-space, 12px); border-bottom:1px var(--line-style, solid) var(--line-color, #cbd5e1); }
.header.is-right { flex-direction: row-reverse; justify-content: flex-start; }
.photo-input { display:none; }
.avatar {
  width: var(--photo-size);
  height: var(--photo-size);
  border: var(--photo-border);
  position: relative;
  overflow: hidden;
  background: var(--primary, #0f4c81);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  flex: 0 0 auto;
  cursor: pointer;
  transition: transform .15s ease, box-shadow .15s ease;
}
.avatar--shape-circle { border-radius: 999px; clip-path: circle(50% at 50% 50%); }
.avatar--shape-rounded { border-radius: 16px; }
.avatar--shape-square { border-radius: 10px; }
.avatar--shape-hex {
  border-radius: 0;
  clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0 50%);
}
.avatar--shape-blob {
  border-radius: 58% 42% 62% 38% / 36% 56% 44% 64%;
}
.avatar:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(15, 76, 129, .24); }
.avatar:focus-visible { outline: 2px solid #1d4ed8; outline-offset: 2px; }
.avatar-image { width: 100%; height: 100%; }
.avatar-image :deep(.v-responsive),
.avatar-image :deep(.v-img),
.avatar-image :deep(.v-responsive__content) {
  width: 100%;
  height: 100%;
}
.avatar-image :deep(.v-img__img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}
.avatar-corner-icon {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: rgba(15, 76, 129, 0.92);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  z-index: 2;
  pointer-events: none;
}
.avatar-overlay {
  position: absolute;
  inset: auto 0 0 0;
  background: rgba(0,0,0,.58);
  color: #fff;
  font-size: 11px;
  line-height: 1;
  padding: 6px 4px;
  opacity: 0;
  transition: opacity .15s ease;
}
.avatar:hover .avatar-overlay,
.avatar:focus-visible .avatar-overlay { opacity: 1; }
.avatar-loader { position:absolute; inset:0; display:grid; place-items:center; font-size:11px; background: rgba(0,0,0,.4); }
.avatar--uploading { pointer-events: none; }
.avatar--error { box-shadow: 0 0 0 2px #dc2626 inset; }
.photo-error { margin-top: 4px; color: #b91c1c; font-size: 12px; }
</style>
