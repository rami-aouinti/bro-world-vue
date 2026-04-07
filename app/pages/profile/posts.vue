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
      <BlogPostFeed mode="mine" :show-composer="false" :show-stories="false" />
    </v-container>
  </div>
</template>
