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
    <div class="section-toolbar" aria-hidden="true">
      <v-btn icon="mdi-plus" size="x-small" variant="text" density="compact" />
      <v-btn icon="mdi-view-grid-outline" size="x-small" variant="text" density="compact" />
      <v-btn icon="mdi-palette-outline" size="x-small" variant="text" density="compact" />
      <v-btn icon="mdi-arrow-up" size="x-small" variant="text" density="compact" />
      <v-btn icon="mdi-arrow-down" size="x-small" variant="text" density="compact" />
    </div>
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
  display: grid;
  gap: 8px;
}

.section-toolbar {
  position: absolute;
  left: -54px;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0;
  pointer-events: none;
  transition: opacity .2s ease;
}

.resume-section-block:hover .section-toolbar {
  opacity: 1;
  pointer-events: auto;
}
</style>
