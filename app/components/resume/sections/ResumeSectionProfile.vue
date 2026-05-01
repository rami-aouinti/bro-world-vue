<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'
defineProps<{ resume: ResumeApiItem }>()
</script>

<template>
  <section class="section">
    <h3>Profile</h3>
    <p class="profile-text">{{ resume.resumeInformation?.profileText }}</p>
  </section>
</template>

<style scoped>
.profile-text {
  white-space: pre-line;
}
</style>
