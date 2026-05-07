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
  <div class="resume-preview-page-break" :style="props.top !== null ? { top: `${props.top}px` } : undefined" aria-hidden="true">
    <span>Page {{ pageNumber }}</span>
  </div>
</template>

<style scoped>
.resume-preview-page-break {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
}

.resume-preview-page-break::before,
.resume-preview-page-break::after {
  content: '';
  flex: 1;
  border-top: 1px dashed rgba(100, 116, 139, 0.45);
}

.resume-preview-page-break::before {
  margin-right: 10px;
}

.resume-preview-page-break::after {
  margin-left: 10px;
}

.resume-preview-page-break > span {
  font-size: 11px;
  color: #64748b;
  background: #fff;
  border: 1px solid rgba(148, 163, 184, 0.45);
  border-radius: 999px;
  padding: 2px 10px;
}
</style>
