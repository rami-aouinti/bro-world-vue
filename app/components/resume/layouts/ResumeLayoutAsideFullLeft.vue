<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'
import ResumeLayoutAsideLeft from './ResumeLayoutAsideLeft.vue'

defineProps<{ resume: ResumeApiItem; template?: any; headerBandHeight?: number }>()
</script>

<template>
  <ResumeLayoutAsideLeft :resume="resume" :template="template" :header-band-height="headerBandHeight" header-on-primary />
</template>
