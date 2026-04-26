<script setup lang="ts">
import InboxMessengerPage from '~/components/Inbox/InboxMessengerPage.vue'
const { crmApplicationSlug } = useCrmGeneralApplicationSlug()
</script>

<template>
  <InboxMessengerPage
    :application-slug="crmApplicationSlug"
    route-path="/world/crm/chat"
  />
</template>
