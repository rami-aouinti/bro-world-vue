<script setup lang="ts">
defineProps<{ items?: string[] }>()

const TOTAL_DOTS = 5

function splitItem(raw: string) {
  const match = String(raw || '').match(/^(.*)\s\((\d+)%\)$/)
  return match
    ? { label: match[1], value: Number(match[2]) }
    : { label: String(raw || ''), value: 0 }
}

function filledDots(raw: string) {
  return Math.max(0, Math.min(TOTAL_DOTS, Math.round(splitItem(raw).value / 20)))
}
</script>

<template>
  <div class="cv-sec">
    <div v-for="(item, idx) in items || []" :key="idx" class="cv-item-row">
      <span class="label">{{ splitItem(item).label }}</span>
      <span class="dots" :aria-label="`${filledDots(item)} sur ${TOTAL_DOTS}`">
        <span
          v-for="dot in TOTAL_DOTS"
          :key="dot"
          class="dot"
          :class="{ 'dot--filled': dot <= filledDots(item) }"
          aria-hidden="true"
        />
      </span>
    </div>
  </div>
</template>

<style scoped>
.cv-item-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}
.label {
  text-align: start;
}
.dots {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  min-width: 58px;
  justify-content: flex-end;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  border: 1px solid var(--cv-secondary, #93c5fd);
  background: transparent;
}
.dot--filled {
  background: var(--cv-secondary, #93c5fd);
}
</style>
