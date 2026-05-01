<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'
import ResumeLayoutNoAside from './ResumeLayoutNoAside.vue'

defineProps<{ resume: ResumeApiItem; template?: any; headerBandHeight?: number }>()
</script>

<template>
  <ResumeLayoutNoAside :resume="resume" :template="template" header-on-primary />
</template>
