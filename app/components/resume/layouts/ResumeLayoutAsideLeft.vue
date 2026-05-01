<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'
defineProps<{ resume: ResumeApiItem }>()
</script>

<template>
  <div class="layout aside-left">
    <aside>
      <h3>{{ resume.resumeInformation?.fullName }}</h3>
      <p>{{ resume.resumeInformation?.email }}</p>
      <p>{{ resume.resumeInformation?.phone }}</p>
      <h4>Skills</h4>
      <p v-for="(skill, i) in resume.skills || []" :key="i">{{ skill.title }}</p>
    </aside>
    <main>
      <h3>Experience</h3>
      <p v-for="(item, i) in resume.experiences || []" :key="i">{{ item.title }} · {{ item.company }}</p>
    </main>
  </div>
</template>

<style scoped>
.aside-left { display:grid; grid-template-columns: 260px 1fr; gap:16px; }
</style>
