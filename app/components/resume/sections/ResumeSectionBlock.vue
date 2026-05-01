<script setup lang="ts">
import ResumeSectionHeading from '~/components/Resume/Sections/ResumeSectionHeading.vue'
import SectionToolbar from '~/components/Resume/SectionToolbar.vue'

withDefaults(
  defineProps<{
    sectionKey?: string
    title: string
    icon?: string
    tone?: 'default' | 'on-primary'
    showIcon?: boolean
    isEmpty?: boolean
  }>(),
  {
    sectionKey: undefined,
    icon: undefined,
    tone: 'default',
    showIcon: true,
    isEmpty: false,
  },
)
</script>

<template>
  <section v-if="!isEmpty" class="resume-section-block resume-section-hoverable">
    <SectionToolbar
      v-if="sectionKey"
      :section-key="sectionKey"
      :actions="['add-item', 'change-variant', 'style-panel', 'line-minus', 'line-plus', 'move-up', 'move-down', 'delete-section']"
    />
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
  position: relative;
  overflow: visible;
  display: grid;
  gap: 8px;
}
</style>
