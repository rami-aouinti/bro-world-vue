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

const photoPosition = computed(() =>
  props.template?.photo?.position === 'right' ? 'right' : 'left',
)

const avatarStyle = computed(() => ({
  width: props.template?.photo?.size || '64px',
  height: props.template?.photo?.size || '64px',
  borderRadius: props.template?.photo?.shape === 'square' ? '12px' : '999px',
  border: props.template?.photo?.border || '2px solid var(--primary, #0f4c81)',
}))
</script>

<template>
  <section class="section header" :class="`is-${photoPosition}`">
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
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
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
