<script setup lang="ts">
import SectionItemsRenderer from './SectionItemsRenderer.vue'
import type { ResumeSectionRendererProps } from './types'
defineProps<ResumeSectionRendererProps>()
</script>

<template>
  <SectionItemsRenderer
    :editable="editable"
    :items="items"
    :theme="theme"
    :show-icon="showIcon"
    :density="density"
    section-key="languages"
    template="dots"
  />
</template>
