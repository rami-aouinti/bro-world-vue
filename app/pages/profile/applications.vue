<script setup lang="ts">
definePageMeta({
  title: 'Applications',
  middleware: 'auth',
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <ProfileDrawer />
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <h1 class="text-h4 mb-2">Applications</h1>
      <p class="text-body-1 text-medium-emphasis mb-0">
        Gérez vos applications connectées et vos accès.
      </p>
    </v-container>
  </div>
</template>
