<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'
defineProps<{ resume: ResumeApiItem }>()
</script>

<template>
  <div class="layout aside-right">
    <main>
      <h3>Experience</h3>
      <p v-for="(item, i) in resume.experiences || []" :key="i">{{ item.title }} · {{ item.company }}</p>
    </main>
    <aside>
      <h3>{{ resume.resumeInformation?.fullName }}</h3>
      <p>{{ resume.resumeInformation?.email }}</p>
      <h4>Languages</h4>
      <p v-for="(language, i) in resume.languages || []" :key="i">{{ language.title }}</p>
    </aside>
  </div>
</template>

<style scoped>
.aside-right { display:grid; grid-template-columns: 1fr 260px; gap:16px; }
</style>
