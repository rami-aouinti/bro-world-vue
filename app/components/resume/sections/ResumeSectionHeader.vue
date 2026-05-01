<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'
const props = defineProps<{ resume: ResumeApiItem; showPhoto?: boolean }>()
const initials = computed(() => (props.resume.resumeInformation?.fullName || '?').split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase())
</script>
<template><section class="section header"><div class="avatar">{{ initials }}</div><div><h1>{{ resume.resumeInformation?.fullName }}</h1><p>{{ resume.resumeInformation?.title }}</p></div></section></template>
<style scoped>.header{display:flex;gap:12px;align-items:center}.avatar{width:64px;height:64px;border-radius:50%;background:var(--primary,#0f4c81);color:#fff;display:grid;place-items:center;font-weight:700}</style>
