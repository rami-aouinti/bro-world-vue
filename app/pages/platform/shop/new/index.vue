<script setup lang="ts">
import PlatformPlatformNewApplicationPage from '~/components/Platform/PlatformNewApplicationPage.vue'

definePageMeta({
  title: 'Create Shop Application',
})
</script>

<template>
  <PlatformPlatformNewApplicationPage
    platform-key="shop"
    heading="Create Shop Application"
    subheading="Build your commerce space, configure your catalog and activate your sales plugins."
    :recommended-plugin-keys="['blog']"
  />
</template>
