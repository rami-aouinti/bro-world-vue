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
    <p>
      <a
        v-if="resume.resumeInformation?.homepage"
        :href="resume.resumeInformation.homepage"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ resume.resumeInformation.homepage }}
      </a>
    </p>
    <p>
      <a
        v-if="resume.resumeInformation?.repo_profile"
        :href="resume.resumeInformation.repo_profile"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ resume.resumeInformation.repo_profile }}
      </a>
    </p>
  </section>
</template>
