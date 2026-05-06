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

function circleStyle(raw: string) {
  const value = splitItem(raw).value

  return {
    background: `conic-gradient(var(--cv-secondary, #93c5fd) ${value}%, rgba(148, 163, 184, 0.24) 0)`,
  }
}
</script>

<template>
  <div class="cv-sec cv-sec--circle">
    <span
      v-for="(item, idx) in items || []"
      :key="idx"
      class="circle"
      :style="circleStyle(item)"
      role="img"
      :aria-label="`${splitItem(item).label}: ${splitItem(item).value}%`"
      :title="splitItem(item).label"
    >
      <span>{{ splitItem(item).value }}%</span>
    </span>
  </div>
</template>

<style scoped>
.cv-sec--circle {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.circle {
  display: inline-flex;
  width: 54px;
  height: 54px;
  padding: 6px;
  align-items: center;
  justify-content: center;
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
  background: var(--cv-circle-inner, var(--cv-page-background, #fff));
  color: #334155;
  font-size: 13px;
  font-weight: 700;
}
</style>
