<script setup lang="ts">
import PlatformPlatformNewApplicationPage from '~/components/Platform/PlatformNewApplicationPage.vue'

definePageMeta({
  title: 'Create School Application',
})
</script>

<template>
  <PlatformPlatformNewApplicationPage
    platform-key="school"
    heading="Create School Application"
    subheading="Launch your learning platform with classes, progress tracking, and collaboration plugins."
    :recommended-plugin-keys="['quiz', 'calendar', 'blog', 'chat']"
  />
</template>
