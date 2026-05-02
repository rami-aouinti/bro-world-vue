<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'
import ResumeSectionHoverToolbar from '~/components/Resume/Sections/ResumeSectionHoverToolbar.vue'

defineProps<{ resume: ResumeApiItem }>()
</script>

<template>
  <h3>Project</h3>
  <article v-for="(item, i) in resume.projects || []" :key="i">{{ item.title }}<p>{{ item.description }}</p></article>
</template>
