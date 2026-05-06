<script setup lang="ts">
defineProps<{ items?: string[] }>()

const TOTAL_STARS = 5

function splitItem(raw: string) {
  const match = String(raw || '').match(/^(.*)\s\((\d+)%\)$/)
  return match
    ? { label: match[1], value: Number(match[2]) }
    : { label: String(raw || ''), value: 0 }
}

function filledStars(raw: string) {
  return Math.max(0, Math.min(TOTAL_STARS, Math.round(splitItem(raw).value / 20)))
}
</script>

<template>
  <div class="cv-sec">
    <div v-for="(item, idx) in items || []" :key="idx" class="cv-item-row">
      <span class="label">{{ splitItem(item).label }}</span>
      <span class="stars" :aria-label="`${filledStars(item)} sur ${TOTAL_STARS}`">
        <span
          v-for="star in TOTAL_STARS"
          :key="star"
          class="star"
          :class="{ 'star--filled': star <= filledStars(item) }"
          aria-hidden="true"
        >★</span>
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
.stars {
  display: inline-flex;
  min-width: 64px;
  justify-content: flex-end;
  letter-spacing: 0.75px;
  font-size: 12px;
  line-height: 1;
}
.star {
  color: rgba(148, 163, 184, 0.38);
}
.star--filled {
  color: var(--cv-secondary, #93c5fd);
}
</style>
