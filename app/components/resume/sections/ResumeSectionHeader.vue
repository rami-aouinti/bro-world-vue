<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'

type PhotoShape = 'circle' | 'rounded' | 'square' | 'hex' | 'blob'

const props = defineProps<{ resume: ResumeApiItem; template?: any }>()

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const PHOTO_SHAPES: Array<{ value: PhotoShape; label: string }> = [
  { value: 'circle', label: 'Circle' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'square', label: 'Square' },
  { value: 'hex', label: 'Hex' },
  { value: 'blob', label: 'Blob' },
]

const fileInput = ref<HTMLInputElement | null>(null)
const previewPhotoUrl = ref('')
const photoError = ref('')
const isPhotoLoading = ref(false)
const photoZoom = ref(1)
const photoOffsetX = ref(0)
const customShape = ref<PhotoShape | null>(null)
const borderWidth = ref(2)
const borderColor = ref('#0f4c81')
const borderStyle = ref<'solid' | 'dashed' | 'dotted' | 'double'>('solid')
const customPosition = ref<'left' | 'center' | 'right' | null>(null)

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
  const templatePosition = photo.position === 'right' ? 'right' : photo.position === 'center' ? 'center' : 'left'
  const position = customPosition.value ?? templatePosition
  const size =
    typeof photo.size === 'number'
      ? `${photo.size}px`
      : typeof photo.size === 'string' && photo.size.trim()
        ? photo.size
        : '120px'
  const allowedShapes = new Set(['circle', 'rounded', 'square', 'hex', 'blob'])
  const templateShape =
    typeof photo.shape === 'string' && allowedShapes.has(photo.shape)
      ? photo.shape
      : 'circle'
  const shape = customShape.value ?? (templateShape as PhotoShape)

  return { position, size, shape }
})

const avatarStyle = computed(() => ({
  '--photo-size': photoConfig.value.size,
  '--photo-border': `${borderWidth.value}px ${borderStyle.value} ${borderColor.value}`,
}))

const imageStyle = computed(() => ({
  transform: `scale(${photoZoom.value}) translateX(${photoOffsetX.value}px)`,
  transformOrigin: 'center',
}))

const currentPhotoUrl = computed(() => {
  const resumePhoto = (props.resume as ResumeApiItem & { photoUrl?: string }).photoUrl
  const apiPhoto = props.resume.resumeInformation?.photo
  return previewPhotoUrl.value || resumePhoto || apiPhoto || ''
})

function openPhotoPicker() { fileInput.value?.click() }
function zoomIn() { photoZoom.value = Math.min(2.4, Number((photoZoom.value + 0.1).toFixed(2))) }
function zoomOut() { photoZoom.value = Math.max(0.6, Number((photoZoom.value - 0.1).toFixed(2))) }
function centerPhotoInHeader() {
  customPosition.value = 'center'
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

onMounted(() => { restoreLocalPhoto() })

onBeforeUnmount(() => {
  if (previewPhotoUrl.value.startsWith('blob:')) URL.revokeObjectURL(previewPhotoUrl.value)
})
</script>

<template>
  <section class="section header" :class="`is-${photoConfig.position}`">
    <div class="avatar-shell">
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
          :style="imageStyle"
          cover
        />
        <span v-else>{{ initials }}</span>
        <span v-if="isPhotoLoading" class="avatar-loader">Loading…</span>
      </button>

      <v-menu location="top" offset="8">
        <template #activator="{ props: menuProps }">
          <v-btn color="primary" variant="text" class="avatar-tool avatar-tool--top-left" icon="mdi-shape-outline" size="x-small" density="comfortable" v-bind="menuProps" />
        </template>
        <v-list density="compact">
          <v-list-item v-for="shape in PHOTO_SHAPES" :key="shape.value" @click="customShape = shape.value">
            <v-list-item-title>{{ shape.label }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn color="primary" variant="text" class="avatar-tool avatar-tool--left" icon="mdi-magnify-plus" size="x-small" density="comfortable" @click="zoomIn" />
      <v-btn color="primary" variant="text" class="avatar-tool avatar-tool--bottom-left" icon="mdi-magnify-minus" size="x-small" density="comfortable" @click="zoomOut" />
      <v-btn color="primary" variant="text" class="avatar-tool avatar-tool--right" icon="mdi-format-horizontal-align-center" size="x-small" density="comfortable" title="Centrer la photo" @click="centerPhotoInHeader" />

      <v-menu location="bottom" offset="8">
        <template #activator="{ props: menuProps }">
          <v-btn color="primary" variant="text" class="avatar-tool avatar-tool--bottom-right" icon="mdi-border-all-variant" size="x-small" density="comfortable" v-bind="menuProps" />
        </template>
        <div class="avatar-border-menu">
          <label>Border width</label>
          <v-slider v-model="borderWidth" min="0" max="8" step="1" hide-details density="compact" />
          <label>Border color</label>
          <input v-model="borderColor" type="color">
          <label>Border style</label>
          <v-select v-model="borderStyle" :items="['solid', 'dashed', 'dotted', 'double']" density="compact" hide-details />
        </div>
      </v-menu>
    </div>

    <input ref="fileInput" class="photo-input" type="file" accept="image/png,image/jpeg,image/webp" @change="onPhotoSelected">

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
.header.is-center { justify-content: center; text-align: center; }
.photo-input { display:none; }
.avatar-shell { position: relative; flex: 0 0 auto; }
.avatar {
  width: var(--photo-size);
  height: var(--photo-size);
  border: var(--photo-border);
  position: relative;
  overflow: hidden;
  background: transparent;
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
.avatar--shape-hex { border-radius: 0; clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0 50%); }
.avatar--shape-blob { border-radius: 58% 42% 62% 38% / 36% 56% 44% 64%; }
.avatar:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(15, 76, 129, .24); }
.avatar:focus-visible { outline: 2px solid #1d4ed8; outline-offset: 2px; }
.avatar-image { width: 100%; height: 100%; transition: transform .15s ease; }
.avatar-image :deep(.v-responsive), .avatar-image :deep(.v-img), .avatar-image :deep(.v-responsive__content) { width: 100%; height: 100%; }
.avatar-image :deep(.v-img__img) { width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; }
.avatar--with-photo { background: transparent; color: transparent; }
.avatar-tool--camera {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary, 255,255,255));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  z-index: 3;
  pointer-events: none;
}
.avatar-loader { position:absolute; inset:0; display:grid; place-items:center; font-size:11px; background: rgba(0,0,0,.4); }
.avatar--uploading { pointer-events: none; }
.avatar--error { box-shadow: 0 0 0 2px #dc2626 inset; }
.avatar-tool {
  position: absolute !important;
  z-index: 3;
  opacity: 0;
  pointer-events: none;
  transform: scale(.92);
  transition: opacity .15s ease, transform .15s ease;
}
.header:hover .avatar-tool,
.header:focus-within .avatar-tool {
  opacity: 1;
  pointer-events: auto;
  transform: scale(1);
}
.avatar-tool:deep(.v-btn) {
  background: rgb(var(--v-theme-primary)) !important;
  color: rgb(var(--v-theme-on-primary, 255,255,255)) !important;
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-primary)) 75%, #000 25%);
}
.avatar-tool:hover:deep(.v-btn) { filter: brightness(1.05); }
.avatar-tool--top-left { left: -14px; top: -14px; }
.avatar-tool--left { left: -10px; top: calc(50% - 12px); }
.avatar-tool--bottom-left { left: 30%; bottom: -14px; }
.avatar-tool--right { right: -10px; top: calc(50% - 12px); }
.avatar-tool--bottom-right { right: -14px; bottom: -14px; }
.avatar-border-menu { width: 220px; padding: 10px; background: #0f172a; border: 1px solid #334155; color: #e2e8f0; border-radius: 10px; box-shadow: 0 8px 20px rgba(0,0,0,.35); display: grid; gap: 4px; }
.avatar-border-menu label { font-size: 12px; color: #cbd5e1; }
.photo-error { margin-top: 4px; color: #b91c1c; font-size: 12px; }
</style>
