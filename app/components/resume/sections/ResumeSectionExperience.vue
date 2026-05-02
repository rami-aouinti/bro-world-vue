<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'

defineProps<{ resume: ResumeApiItem }>()
</script>

<template>
  <h3 contenteditable="true">Experience</h3>
  <article v-for="(item, i) in resume.experiences || []" :key="i" contenteditable="true"><strong>{{ item.title }}</strong> · {{ item.company }}<p>{{ item.description }}</p></article>
</template>
