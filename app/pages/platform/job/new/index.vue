<script setup lang="ts">
import PlatformPlatformNewApplicationPage from '~/components/Platform/PlatformNewApplicationPage.vue'

definePageMeta({
  title: 'Create Job Application',
})
</script>

<template>
  <PlatformPlatformNewApplicationPage
    platform-key="recruit"
    heading="Create Job Application"
    subheading="Set up your recruitment workspace to publish offers and track applications efficiently."
    platform-alias="jobs"
    :recommended-plugin-keys="['chat', 'quiz']"
  />
</template>
