<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'

defineProps<{ resume: ResumeApiItem }>()
</script>

<template>
  <h3 contenteditable="true">Education</h3>
  <article v-for="(item, i) in resume.educations || []" :key="i" contenteditable="true">{{ item.title }} · {{ item.school }}</article>
</template>
