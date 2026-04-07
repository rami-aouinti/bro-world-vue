<script setup lang="ts">
const route = useRoute()
const conversation = computed(() => String(route.params.conversation || ''))

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
        Conversation ID: <strong>{{ conversation }}</strong>
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
