<script setup lang="ts">
import type { ResumeSectionRendererProps } from './types'

const props = withDefaults(defineProps<ResumeSectionRendererProps & {
  variantLabel: string
}>(), {
  items: () => [],
  theme: () => ({}),
  showIcon: true,
  density: 'normal',
})
</script>

<template>
  <section class="resume-atomic-renderer" :class="`density-${density}`" :style="theme">
    <ul class="renderer-items">
      <li v-for="(item, index) in props.items" :key="index">
        <span v-if="showIcon" aria-hidden="true">•</span>
        <span>{{ variantLabel }} — {{ (item as any)?.name || (item as any)?.title || (item as any)?.label || item }}</span>
      </li>
    </ul>
  </section>
</template>
