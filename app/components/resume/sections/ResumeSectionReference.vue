<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'

defineProps<{ resume: ResumeApiItem }>()
</script>

<template>
  <h3 contenteditable="true">Reference</h3>
  <article v-for="(item, i) in resume.references || []" :key="i" contenteditable="true">{{ item.title }}<p>{{ item.description }}</p></article>
</template>
