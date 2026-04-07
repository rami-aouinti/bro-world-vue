<script setup lang="ts">
const route = useRoute()
const notification = computed(() => String(route.params.notification || ''))

definePageMeta({
  title: 'appbar.notifications',
  icon: 'mdi-bell-ring-outline',
  middleware: 'auth',
})
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>Notification detail</v-card-title>

      <v-card-text v-if="notification">
        Notification ID: <strong>{{ notification }}</strong>
      </v-card-text>

      <v-card-text v-else>
        <div class="d-flex flex-column align-center ga-3 py-8 text-medium-emphasis">
          <v-icon icon="mdi-bell-off-outline" size="40" />
          <p class="text-body-1">Notification introuvable.</p>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
