<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    pageNumber: number
    top?: number | null
  }>(),
  {
    top: null,
  },
)
</script>

<template>
  <div
    class="resume-preview-page-break"
    :style="props.top !== null ? { top: `${props.top}px` } : undefined"
    aria-hidden="true"
  />
</template>

<style scoped>
.resume-preview-page-break {
  position: absolute;
  left: 0;
  right: 0;
  height: 18px;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 3;
  background: rgb(var(--v-theme-surface));
  border-top: 1px solid
    color-mix(in srgb, rgb(var(--v-theme-on-surface)) 20%, transparent);
  border-bottom: 1px solid
    color-mix(in srgb, rgb(var(--v-theme-on-surface)) 20%, transparent);
}
</style>
