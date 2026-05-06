<script setup lang="ts">
import InboxMessengerPage from '~/components/Inbox/InboxMessengerPage.vue'

definePageMeta({
  title: 'appbar.inbox',
  description:
    'Private Bro World inbox for authenticated conversations and messages.',
  robots: { index: false, follow: false },
  sitemap: false,
  middleware: 'auth',
})
</script>

<template>
  <InboxMessengerPage />
</template>
