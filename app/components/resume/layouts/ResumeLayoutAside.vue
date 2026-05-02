<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'
import ResumeLayoutNoAside from './ResumeLayoutNoAside.vue'

const emit = defineEmits<{ (event: 'change-variant', sectionKey: string, variant: string): void }>()
defineProps<{ resume: ResumeApiItem; template?: any; headerBandHeight?: number }>()
</script>

<template>
  <ResumeLayoutNoAside :resume="resume" :template="template" header-on-primary  @change-variant="(sectionKey, variant) => emit('change-variant', sectionKey, variant)" />
</template>
