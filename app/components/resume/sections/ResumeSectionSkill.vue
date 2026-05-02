<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'
import ResumeSectionHoverToolbar from '~/components/Resume/Sections/ResumeSectionHoverToolbar.vue'

defineProps<{ resume: ResumeApiItem }>()
</script>

<template>
  <ResumeSectionHoverToolbar class="section">
    <template #title>
      <h3>Skill</h3>
    </template>
    <article v-for="(item, i) in resume.skills || []" :key="i">{{ item.title }} <small>{{ item.level }}</small></article>
  </ResumeSectionHoverToolbar>
</template>
