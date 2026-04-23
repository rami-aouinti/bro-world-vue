<script setup lang="ts">
import PlatformPlatformNewApplicationPage from '~/components/Platform/PlatformNewApplicationPage.vue'

definePageMeta({
  title: 'Create CRM Application',
})
</script>

<template>
  <PlatformPlatformNewApplicationPage
    platform-key="crm"
    heading="Create CRM Application"
    subheading="Creation assistant with stepper, configuration, and plugins."
    :recommended-plugin-keys="['calendar', 'chat']"
  />
</template>
