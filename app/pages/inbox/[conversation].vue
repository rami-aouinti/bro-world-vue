<script setup lang="ts">
import InboxMessengerPage from '~/components/Inbox/InboxMessengerPage.vue'
definePageMeta({
  title: 'appbar.inbox',
  middleware: 'auth',
})

const route = useRoute()
await navigateTo(
  {
    path: '/inbox',
    query: {
      conversation: String(route.params.conversation || ''),
    },
  },
  {
    redirectCode: 301,
    replace: true,
  },
)
</script>

<template>
  <div />
</template>
