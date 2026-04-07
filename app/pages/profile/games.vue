<script setup lang="ts">
definePageMeta({
  title: 'Games',
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
      <h1 class="text-h4 mb-2">Games</h1>
      <p class="text-body-1 text-medium-emphasis mb-0">
        Accédez à vos jeux et activités.
      </p>
    </v-container>
  </div>
</template>
