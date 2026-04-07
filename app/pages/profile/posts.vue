<script setup lang="ts">
definePageMeta({
  title: 'Posts',
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
      <h1 class="text-h4 mb-2">Posts</h1>
      <p class="text-body-1 text-medium-emphasis mb-0">
        Consultez et gérez vos publications.
      </p>
    </v-container>
  </div>
</template>
