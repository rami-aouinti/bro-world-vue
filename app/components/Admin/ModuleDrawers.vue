<script setup lang="ts">
import { ADMIN_SECTIONS } from '~/constants/adminManagement'

const route = useRoute()
</script>

<template>
  <AppPageDrawers>
    <template #left>
      <v-list nav density="compact" rounded="xl" class="bg-transparent">
        <v-list-item
          title="Admin Dashboard"
          prepend-icon="mdi-monitor-dashboard"
          to="/admin"
          :active="route.path === '/admin'"
          rounded="lg"
          color="primary"
        />
        <v-list-item
          v-for="item in ADMIN_SECTIONS"
          :key="item.key"
          :title="item.navTitle"
          :prepend-icon="item.icon"
          :to="item.route"
          :active="route.path === item.route"
          rounded="lg"
          color="primary"
        />
      </v-list>
    </template>
  </AppPageDrawers>
</template>
