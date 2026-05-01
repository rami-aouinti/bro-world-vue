<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'
defineProps<{ resume: ResumeApiItem }>()
</script>

<template>
  <div class="layout no-aside">
    <h2>{{ resume.resumeInformation?.fullName }}</h2>
    <p>{{ resume.resumeInformation?.email }} · {{ resume.resumeInformation?.phone }}</p>
    <h3>Experience</h3>
    <p v-for="(item, i) in resume.experiences || []" :key="i">{{ item.title }} · {{ item.company }}</p>
  </div>
</template>
