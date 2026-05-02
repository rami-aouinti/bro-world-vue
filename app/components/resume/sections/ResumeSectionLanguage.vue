<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'

defineProps<{ resume: ResumeApiItem }>()
</script>

<template>
  <h3 contenteditable="true">Language</h3>
  <article v-for="(item, i) in resume.languages || []" :key="i" contenteditable="true">{{ item.name || item.title }} - {{ item.countryCode }}</article>
</template>
