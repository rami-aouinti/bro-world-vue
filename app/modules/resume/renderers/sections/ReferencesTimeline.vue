<script setup lang="ts">
import SectionItemsRenderer from './SectionItemsRenderer.vue'
import type { ResumeSectionRendererProps } from './types'
defineProps<ResumeSectionRendererProps>()
</script>

<template>
  <SectionItemsRenderer
    :items="items"
    :theme="theme"
    :show-icon="showIcon"
    :density="density"
    section-key="references"
    template="timeline"
  />
</template>
