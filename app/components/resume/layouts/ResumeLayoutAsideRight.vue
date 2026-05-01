<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'
import ResumeLayoutAsideLeft from './ResumeLayoutAsideLeft.vue'

defineProps<{ resume: ResumeApiItem; template?: any }>()
</script>

<template>
  <ResumeLayoutAsideLeft :resume="resume" :template="template" reverse />
</template>
