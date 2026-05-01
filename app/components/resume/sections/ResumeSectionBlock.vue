<script setup lang="ts">
import ResumeSectionHeading from '~/components/Resume/Sections/ResumeSectionHeading.vue'

withDefaults(
  defineProps<{
    title: string
    icon?: string
    tone?: 'default' | 'on-primary'
    showIcon?: boolean
    isEmpty?: boolean
  }>(),
  {
    icon: undefined,
    tone: 'default',
    showIcon: true,
    isEmpty: false,
  },
)
</script>

<template>
  <section v-if="!isEmpty" class="resume-section-block">
    <ResumeSectionHeading
      :title="title"
      :icon="icon"
      :tone="tone"
      :show-icon="showIcon"
      variant="h3"
    />
    <slot />
  </section>
</template>

<style scoped>
.resume-section-block {
  display: grid;
  gap: 8px;
}
</style>
