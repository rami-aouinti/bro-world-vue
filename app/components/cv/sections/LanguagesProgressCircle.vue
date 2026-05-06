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
  <div class="cv-sec cv-sec--circle">
    <div v-for="(item, idx) in items || []" :key="idx" class="cv-item-row">
      <span class="label">{{ splitItem(item).label }}</span>
      <span
        class="circle"
        :style="{
          background: `conic-gradient(var(--cv-secondary, #93c5fd) ${splitItem(item).value}%, rgba(148, 163, 184, 0.28) 0)`,
        }"
        role="img"
        :aria-label="`${splitItem(item).value}%`"
      >
        <span>{{ splitItem(item).value }}%</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.cv-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.label {
  text-align: start;
}
.circle {
  display: inline-flex;
  width: 32px;
  height: 32px;
  padding: 3px;
  border-radius: 999px;
  flex: 0 0 auto;
}
.circle span {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  border-radius: inherit;
  background: var(--cv-circle-inner, #fff);
  color: #334155;
  font-size: 8px;
  font-weight: 700;
}
</style>
