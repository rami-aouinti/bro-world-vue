<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'
import ResumeSectionHoverToolbar from '~/components/Resume/Sections/ResumeSectionHoverToolbar.vue'

defineProps<{ resume: ResumeApiItem }>()
</script>

<template>
  <ResumeSectionHoverToolbar class="section">
    <template #title>
      <h3>Project</h3>
    </template>
    <article v-for="(item, i) in resume.projects || []" :key="i">{{ item.title }}<p>{{ item.description }}</p></article>
  </ResumeSectionHoverToolbar>
</template>
