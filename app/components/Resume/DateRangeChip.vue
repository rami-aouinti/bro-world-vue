<script setup lang="ts">
import { formatResumeMonthYear } from '~/utils/resumeDateFormat'

const props = withDefaults(
  defineProps<{
    start?: string
    end?: string
    editable?: boolean
  }>(),
  {
    start: '',
    end: '',
    editable: false,
  },
)

const emit = defineEmits<{
  (event: 'update:start', value: string): void
  (event: 'update:end', value: string): void
}>()

function onStartInput(event: Event) {
  const value = formatResumeMonthYear((event.target as HTMLElement).innerText)
  emit('update:start', value)
}

function onEndInput(event: Event) {
  const value = formatResumeMonthYear((event.target as HTMLElement).innerText)
  emit('update:end', value)
}
</script>

<template>
  <v-chip size="small" color="primary" variant="tonal" class="resume-date-chip">
    <span class="editable-text" :contenteditable="editable" @input="onStartInput">
      {{ formatResumeMonthYear(start) }}
    </span>
    -
    <span class="editable-text" :contenteditable="editable" @input="onEndInput">
      {{ formatResumeMonthYear(end) }}
    </span>
  </v-chip>
</template>

<style scoped>
.resume-date-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--cv-accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--cv-accent) 24%, transparent);
}

@media print {
  .resume-date-chip {
    background-color: color-mix(in srgb, var(--cv-accent) 18%, white) !important;
    color: color-mix(in srgb, var(--cv-accent) 78%, #0f2f64) !important;
    border: 1px solid color-mix(in srgb, var(--cv-accent) 35%, white) !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
</style>
