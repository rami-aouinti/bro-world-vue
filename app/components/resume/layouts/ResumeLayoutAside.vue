<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'
defineProps<{ resume: ResumeApiItem }>()
</script>

<template>
  <div class="layout layout--aside">
    <header class="header">
      <div>
        <h2>{{ resume.resumeInformation?.fullName }}</h2>
        <p>{{ resume.resumeInformation?.title }}</p>
      </div>
    </header>
    <section>
      <h3>Experience</h3>
      <p v-for="(item, i) in resume.experiences || []" :key="i">
        {{ item.title }} · {{ item.company }}
      </p>
    </section>
  </div>
</template>

<style scoped>
.layout--aside .header { display:flex; justify-content:space-between; margin-bottom:16px; }
</style>
