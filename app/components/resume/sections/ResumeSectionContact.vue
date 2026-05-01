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
  <section class="section">
    <h3 v-if="showTitle">Contact</h3>
    <p>{{ resume.resumeInformation?.email }}</p>
    <p>{{ resume.resumeInformation?.phone }}</p>
    <p>{{ resume.resumeInformation?.adresse }}</p>
    <p>{{ resume.resumeInformation?.birthDate }}</p>
    <p>{{ resume.resumeInformation?.homepage }}</p>
    <p>{{ resume.resumeInformation?.repo_profile }}</p>
  </section>
</template>
