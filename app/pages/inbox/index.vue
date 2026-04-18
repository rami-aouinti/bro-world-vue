<script setup lang="ts">
import InboxMessengerPage from '~/components/Inbox/InboxMessengerPage.vue'

definePageMeta({
  title: 'appbar.inbox',
  middleware: 'auth',
})
</script>

<template>
  <InboxMessengerPage />
</template>
