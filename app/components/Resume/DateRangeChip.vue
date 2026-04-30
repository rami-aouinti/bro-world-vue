<script setup lang="ts">
import { formatResumeMonthYear } from '~/utils/resumeDateFormat'

const props = withDefaults(
  defineProps<{
    start?: string
    end?: string
    editable?: boolean
    variant?: 'chip' | 'text'
  }>(),
  {
    start: '',
    end: '',
    editable: false,
    variant: 'chip',
  },
)

const emit = defineEmits<{
  (event: 'update:start' | 'update:end', value: string): void
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
  <v-chip
    v-if="props.variant === 'chip'"
    size="small"
    color="primary"
    variant="tonal"
    class="resume-date-chip"
  >
    <span
      class="editable-text"
      :contenteditable="editable"
      @input="onStartInput"
    >
      {{ formatResumeMonthYear(start) }}
    </span>
    -
    <span class="editable-text" :contenteditable="editable" @input="onEndInput">
      {{ formatResumeMonthYear(end) }}
    </span>
  </v-chip>
  <p v-else class="resume-date-range">
    <span
      class="editable-text"
      :contenteditable="editable"
      @input="onStartInput"
    >
      {{ formatResumeMonthYear(start) }}
    </span>
    -
    <span class="editable-text" :contenteditable="editable" @input="onEndInput">
      {{ formatResumeMonthYear(end) }}
    </span>
  </p>
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

.resume-date-range {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: color-mix(in srgb, var(--cv-title) 76%, var(--cv-text));
}

@media print {
  .resume-date-chip {
    background-color: color-mix(
      in srgb,
      var(--cv-accent) 18%,
      white
    ) !important;
    color: color-mix(in srgb, var(--cv-accent) 78%, #0f2f64) !important;
    border: 1px solid color-mix(in srgb, var(--cv-accent) 35%, white) !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .resume-date-range {
    color: color-mix(in srgb, var(--cv-title) 68%, black) !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
</style>
