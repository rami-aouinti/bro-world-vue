<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'
import ResumeSectionHoverToolbar from '~/components/Resume/Sections/ResumeSectionHoverToolbar.vue'

defineProps<{ resume: ResumeApiItem }>()
</script>

<template>
  <ResumeSectionHoverToolbar class="section">
    <template #title>
      <h3>Experience</h3>
    </template>
    <article v-for="(item, i) in resume.experiences || []" :key="i"><strong>{{ item.title }}</strong> · {{ item.company }}<p>{{ item.description }}</p></article>
  </ResumeSectionHoverToolbar>
</template>
