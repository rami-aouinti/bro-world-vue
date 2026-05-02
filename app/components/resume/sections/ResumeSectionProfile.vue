<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'

withDefaults(
  defineProps<{
    resume: ResumeApiItem
    showTitle?: boolean
  }>(),
  { showTitle: true },
)
</script>

<template>
  <h3 v-if="showTitle" contenteditable="true">Profile</h3>
  <p class="profile-text" contenteditable="true">{{ resume.resumeInformation?.profileText }}</p>
</template>

<style scoped>
.profile-text {
  white-space: pre-line;
}
</style>
