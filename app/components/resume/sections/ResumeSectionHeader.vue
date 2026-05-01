<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'

const props = defineProps<{ resume: ResumeApiItem; template?: any }>()

const initials = computed(() =>
  (props.resume.resumeInformation?.fullName || '?')
    .split(' ')
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

const photoConfig = computed(() => {
  const photo = props.template?.photo ?? {}
  const position = photo.position === 'right' ? 'right' : 'left'
  const size =
    typeof photo.size === 'number'
      ? `${photo.size}px`
      : typeof photo.size === 'string' && photo.size.trim()
        ? photo.size
        : '64px'
  const shape = photo.shape === 'square' || photo.shape === 'rounded' ? photo.shape : 'circle'
  const borderRadius = shape === 'square' ? '10px' : shape === 'rounded' ? '16px' : '999px'
  const border = typeof photo.border === 'string' && photo.border.trim()
    ? photo.border
    : '2px solid var(--primary, #0f4c81)'

  return { position, size, borderRadius, border }
})

const avatarStyle = computed(() => ({
  width: photoConfig.value.size,
  height: photoConfig.value.size,
  borderRadius: photoConfig.value.borderRadius,
  border: photoConfig.value.border,
}))
</script>

<template>
  <section class="section header" :class="`is-${photoConfig.position}`">
    <div class="avatar" :style="avatarStyle">{{ initials }}</div>
    <div>
      <h1>{{ resume.resumeInformation?.fullName }}</h1>
      <p>{{ resume.resumeInformation?.title }}</p>
    </div>
  </section>
</template>

<style scoped>
.header {
  display: flex;
  gap: var(--section-space, 12px);
  align-items: center;
  margin-bottom: calc(var(--section-space, 12px) * 1.33);
  padding-bottom: var(--section-space, 12px);
  border-bottom: 1px var(--line-style, solid) var(--line-color, #cbd5e1);
}

.header.is-right {
  flex-direction: row-reverse;
  justify-content: flex-start;
}

.avatar {
  background: var(--primary, #0f4c81);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  flex: 0 0 auto;
}
</style>
