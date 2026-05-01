<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi';import ResumeLayoutNoAside from './ResumeLayoutNoAside.vue'
defineProps<{ resume: ResumeApiItem; template?: any }>()
</script>
<template><ResumeLayoutNoAside :resume="resume" :template="template"/></template>
