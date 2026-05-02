<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'
import ResumeSectionHoverToolbar from '~/components/Resume/Sections/ResumeSectionHoverToolbar.vue'

withDefaults(
  defineProps<{
    resume: ResumeApiItem
    showTitle?: boolean
  }>(),
  { showTitle: true },
)
</script>

<template>
  <ResumeSectionHoverToolbar class="section">
    <template #title>
      <h3 v-if="showTitle">Profile</h3>
    </template>
    <p class="profile-text">{{ resume.resumeInformation?.profileText }}</p>
  </ResumeSectionHoverToolbar>
</template>

<style scoped>
.profile-text {
  white-space: pre-line;
}
</style>
