<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'

defineProps<{ resume: ResumeApiItem }>()
</script>

<template>
  <h3 contenteditable="true">Skill</h3>
  <article v-for="(item, i) in resume.skills || []" :key="i" contenteditable="true">{{ item.title }} <small>{{ item.level }}</small></article>
</template>
