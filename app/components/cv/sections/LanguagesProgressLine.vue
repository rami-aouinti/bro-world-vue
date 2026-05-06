<script setup lang="ts">
defineProps<{ items?: string[] }>()

function splitItem(raw: string) {
  const match = String(raw || '').match(/^(.*)\s\((\d+)%\)$/)
  const value = match ? Number(match[2]) : 0
  return {
    label: match ? match[1] : String(raw || ''),
    value: Math.max(0, Math.min(100, value)),
  }
}
</script>

<template>
  <div class="cv-sec">
    <div v-for="(item, idx) in items || []" :key="idx" class="cv-item-row">
      <span class="label">{{ splitItem(item).label }}</span>
      <span
        class="progress-line"
        role="img"
        :aria-label="`${splitItem(item).value}%`"
      >
        <i :style="{ width: `${splitItem(item).value}%` }" />
      </span>
    </div>
  </div>
</template>

<style scoped>
.cv-item-row {
  display: grid;
  grid-template-columns: 1fr 78px;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
}
.label {
  text-align: start;
}
.progress-line {
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.32);
}
.progress-line i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--cv-secondary, #93c5fd);
}
</style>
