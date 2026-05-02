<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'
import ResumeLayoutAsideLeft from './ResumeLayoutAsideLeft.vue'

const emit = defineEmits<{ (event: 'change-variant', sectionKey: string, variant: string): void }>()
defineProps<{ resume: ResumeApiItem; template?: any; headerBandHeight?: number }>()
</script>

<template>
  <ResumeLayoutAsideLeft :resume="resume" :template="template" :header-band-height="headerBandHeight" reverse  @change-variant="(sectionKey, variant) => emit('change-variant', sectionKey, variant)" />
</template>
