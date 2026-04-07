<script setup lang="ts">
const route = useRoute()
const conversationId = computed(() => String(route.params.conversation || ''))
const inboxNotificationsStore = useInboxNotificationsStore()

const conversation = computed(() =>
  inboxNotificationsStore.getInboxById(conversationId.value),
)

definePageMeta({
  title: 'appbar.inbox',
  icon: 'mdi-email-outline',
  middleware: 'auth',
})
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>Conversation detail</v-card-title>

      <v-card-text v-if="conversation">
        <div class="text-subtitle-1 font-weight-medium">{{ conversation.title }}</div>
        <div class="text-body-2 text-medium-emphasis mb-3">{{ conversation.createdAt }}</div>
        <div class="text-body-1">{{ conversation.content || conversation.preview }}</div>
      </v-card-text>

      <v-card-text v-else>
        <div class="d-flex flex-column align-center ga-3 py-8 text-medium-emphasis">
          <v-icon icon="mdi-email-off-outline" size="40" />
          <p class="text-body-1">Conversation introuvable.</p>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
