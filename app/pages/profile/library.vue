<script setup lang="ts">
definePageMeta({
  title: 'Library',
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
      <h1 class="text-h4 mb-2">Library</h1>
      <p class="text-body-1 text-medium-emphasis mb-0">
        Retrouvez ici votre bibliothèque personnelle.
      </p>
    </v-container>
  </div>
</template>
