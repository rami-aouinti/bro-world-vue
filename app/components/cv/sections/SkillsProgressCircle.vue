<script setup lang="ts">
defineProps<{ items?: string[] }>()

function splitItem(raw: string) {
  const match = String(raw || '').match(/^(.*)\s\((\d+)%\)$/)
  return match
    ? { label: match[1], value: Number(match[2]) }
    : { label: String(raw || ''), value: 20 }
}
</script>

<template>
  <div>
    <div v-for="(item, idx) in items || []" :key="idx" class="row">
      <span>{{ splitItem(item).label }}</span>
      <span class="circle">{{ splitItem(item).value }}%</span>
    </div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  text-align: center;
}
.circle {
  width: 39px;
  height: 39px;
  border-radius: 999px;
  border: 2px solid var(--cv-secondary, #93c5fd);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
}
</style>
