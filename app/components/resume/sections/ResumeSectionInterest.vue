<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'

defineProps<{ resume: ResumeApiItem }>()
</script>

<template>
  <h3 contenteditable="true">Interest</h3>
  <article v-for="(item, i) in resume.hobbies || []" :key="i" contenteditable="true">{{ item.title }}</article>
</template>
