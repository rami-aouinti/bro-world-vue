<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi';import { STRUCTURES, type SectionKey } from './layoutSections'
import ResumeLayoutAsideLeft from './ResumeLayoutAsideLeft.vue'
defineProps<{ resume: ResumeApiItem; template?: any }>()
</script>
<template><ResumeLayoutAsideLeft :resume="resume" :template="template" class="right"/></template>
<style scoped>.right{direction:rtl}.right :deep(*){direction:ltr}</style>
