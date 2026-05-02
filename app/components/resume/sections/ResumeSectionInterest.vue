<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'

defineProps<{ resume: ResumeApiItem }>()
</script>

<template>
      <h3>Interest</h3>
    <article v-for="(item, i) in resume.hobbies || []" :key="i">{{ item.title }}</article>
</template>
