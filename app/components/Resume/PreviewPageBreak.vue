<script setup lang="ts">
const props = defineProps<{
  pageNumber: number
  top?: number | string
}>()

const breakStyle = computed(() => {
  if (props.top === undefined) return undefined
  const top = typeof props.top === 'number' ? `${props.top}px` : props.top
  return { top }
})
</script>

<template>
  <div class="resume-preview-page-break" :class="{ 'resume-preview-page-break--absolute': top !== undefined }" :style="breakStyle">
    <div class="resume-preview-page-break__bar" />
    <span class="resume-preview-page-break__label">End of page {{ pageNumber }}</span>
  </div>
</template>

<style scoped>
.resume-preview-page-break {
  position: relative;
  width: min(850px, 100%);
  margin: 16px auto 0;
  pointer-events: none;
  color: #64748b;
  text-align: center;
}

.resume-preview-page-break--absolute {
  position: absolute;
  right: 0;
  left: 0;
  z-index: 4;
  width: 100%;
  margin: 0;
  transform: translateY(-50%);
}

.resume-preview-page-break__bar {
  height: 5px;
  width: 100%;
  border-radius: 999px;
  background: rgba(148, 163, 184, .22);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, .18);
}

.resume-preview-page-break__label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 6px;
  padding: 3px 10px;
  border: 1px solid rgba(148, 163, 184, .35);
  border-radius: 999px;
  background: rgba(248, 250, 252, .92);
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
  line-height: 1.2;
  text-transform: uppercase;
}

@media print {
  .resume-preview-page-break {
    display: none !important;
  }
}
</style>
